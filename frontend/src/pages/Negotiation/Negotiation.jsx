import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Phone, Video, Check, 
  Paperclip, ShieldCheck, Edit2, CheckCircle,
  Info, ShoppingCart, Tag, Bell, AlertTriangle, X,
  Minus, Plus, PhoneOff
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import Header from '../../components/Header';

const Negotiation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // User Data
  const userData = sessionStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const currentUserId = user?._id || user?.id;
  
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dealStatus, setDealStatus] = useState('PENDING'); // null until fetched, then PENDING, ACCEPTED, etc.
  const [agreedPrice, setAgreedPrice] = useState(0);
  const [counterParty, setCounterParty] = useState({ name: '', initial: '' });
  const [activeChatTab, setActiveChatTab] = useState('Chat');
  const [callPermission, setCallPermission] = useState('NONE'); // NONE, REQUESTING, GRANTED, DENIED
  const [incomingCallRequest, setIncomingCallRequest] = useState(null);
  const chatEndRef = useRef(null);
  const socket = useRef(null);
  const [userRole, setUserRole] = useState('buyer');
  const isSeller = userRole === 'seller';
  
  // Cooldown State
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [lastDeclinedAt, setLastDeclinedAt] = useState(null);

  // Emergency Buzzer State
  const [buzzerCooldown, setBuzzerCooldown] = useState(false);
  const [buzzerCooldownTime, setBuzzerCooldownTime] = useState(0);
  const [incomingBuzz, setIncomingBuzz] = useState(null);
  const audioCtxRef = useRef(null);

  // Voice Call States
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteAudioRef = useRef(null);

  // Pre-initialize AudioContext on first user interaction (required by browsers)
  useEffect(() => {
    const warmUpAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener('click', warmUpAudio, { once: false });
    document.addEventListener('keydown', warmUpAudio, { once: false });
    return () => {
      document.removeEventListener('click', warmUpAudio);
      document.removeEventListener('keydown', warmUpAudio);
    };
  }, []);

  const scrollToBottom = (force = false) => {
    const messagesContainer = chatEndRef.current?.parentElement;
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (force || isNearBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.sender === 'you' || lastMessage?.sender === 'system';
    scrollToBottom(isMyMessage);
  }, [messages]);

  const userRoleRef = useRef('buyer');

  useEffect(() => {
    if (user) {
      setUserRole(user.role || 'buyer');
      userRoleRef.current = user.role || 'buyer';
    } else {
      setUserRole('buyer');
      userRoleRef.current = 'buyer';
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
      ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:5001' 
        : 'https://zylora-e-commerce.onrender.com');

    const fetchProductAndChat = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Product
        const prodRes = await axios.get(`${BACKEND_URL}/api/products/${id}`);
        let currentProduct = null;
        if (prodRes.data.success) {
          const p = prodRes.data.data;
          currentProduct = {
            id: p._id,
            name: p.name,
            price: p.price,
            images: p.images || ['https://placehold.co/300x300/f3f4f6/9ca3af'],
            seller: p.seller || { name: 'Verified Seller' },
            brand: p.brand || 'Premium'
          };
          setProduct(currentProduct);
          setAgreedPrice(currentProduct.price * 0.9);
        } else {
          // Fallback to static
          const staticProd = products.find(p => p.id === parseInt(id));
          if (staticProd) {
            currentProduct = staticProd;
            setProduct(staticProd);
            setAgreedPrice(staticProd.price * 0.9);
          }
        }

        // 2. Fetch Chat History
        if (token) {
          const searchParams = new URLSearchParams(window.location.search);
          const targetBuyerId = searchParams.get('buyerId');
          const chatUrl = `${BACKEND_URL}/api/negotiation/${id}${targetBuyerId ? `?buyerId=${targetBuyerId}` : ''}`;
          
          const chatRes = await axios.get(chatUrl, config);
          
          if (chatRes.data.success) {
            if (chatRes.data.negotiation) {
              setDealStatus(chatRes.data.negotiation.status);
              setAgreedPrice(chatRes.data.negotiation.agreedPrice || currentProduct.price);
              setQuantity(chatRes.data.negotiation.quantity || 1);

              // Set counterparty info
              if (userRole === 'seller' && chatRes.data.negotiation.buyer) {
                setCounterParty({
                  name: chatRes.data.negotiation.buyer.name,
                  initial: chatRes.data.negotiation.buyer.name.slice(0, 2).toUpperCase()
                });
              } else if (userRole === 'buyer' && chatRes.data.negotiation.seller) {
                setCounterParty({
                  name: chatRes.data.negotiation.seller.name,
                  initial: chatRes.data.negotiation.seller.name.slice(0, 2).toUpperCase()
                });
              }

              if (chatRes.data.negotiation.status === 'DECLINED') {
                setLastDeclinedAt(chatRes.data.negotiation.updatedAt || chatRes.data.negotiation.lastMessageAt);
              }
            } else {
              setDealStatus('NEW');
              setAgreedPrice(currentProduct.price);
              setQuantity(1);
            }

            if (chatRes.data.data.length > 0) {
            const history = chatRes.data.data.map(m => ({
              id: m._id,
              sender: (m.sender._id || m.sender) === currentUserId ? 'you' : (userRole === 'seller' ? 'buyer' : 'seller'),
              text: m.text,
              type: m.type,
              offerPrice: m.offerPrice,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: m.status
            }));
            setMessages(history);
          } else if (currentProduct) {
            // Default welcome message if no history
            setMessages([
              { id: 1, sender: 'seller', text: `Hi! I'm the seller of ${currentProduct.name}. How can I help you today?`, time: '10:48 AM' }
            ]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndChat();
  }, [id, navigate]);

  const setupPeerConnection = useCallback((room) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('ice_candidate', { room, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    }
  }, []);

  const handleRequestCallPermission = (type = 'voice') => {
    if (!socket.current) return;
    setCallPermission('REQUESTING');
    
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? currentUserId : null);
    const room = targetBuyerId ? `${id}_${targetBuyerId}` : id;

    socket.current.emit('request_call_permission', {
      from: currentUserId,
      name: user?.name || 'User',
      room,
      type
    });
  };

  const handleRespondCallPermission = (allowed) => {
    if (!socket.current || !incomingCallRequest) return;
    
    socket.current.emit('respond_call_permission', {
      from: currentUserId,
      room: incomingCallRequest.room,
      allowed,
      type: incomingCallRequest.type
    });
    
    setIncomingCallRequest(null);
  };

  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      
      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? currentUserId : null);
      const room = targetBuyerId ? `${id}_${targetBuyerId}` : id;

      setupPeerConnection(room);
      setIsCalling(true);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current.emit('call_user', {
        from: currentUserId,
        name: user?.name || 'User',
        room,
        signalData: offer
      });
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Could not access microphone');
    }
  };

  const handleAcceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? currentUserId : null);
      const room = targetBuyerId ? `${id}_${targetBuyerId}` : id;

      setupPeerConnection(room);
      setCallActive(true);
      setIncomingCall(null);

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.signalData));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.current.emit('answer_call', {
        from: currentUserId,
        room,
        signalData: answer
      });
    } catch (err) {
      console.error('Error accepting call:', err);
      alert('Could not access microphone');
    }
  };

  const handleEndCall = useCallback((emit = true) => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (emit && socket.current) {
      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? currentUserId : null);
      const room = targetBuyerId ? `${id}_${targetBuyerId}` : id;
      socket.current.emit('end_call', { room });
    }

    setCallActive(false);
    setIsCalling(false);
    setIncomingCall(null);
    setRemoteStream(null);
  }, [id, currentUserId, userRole]);

  // Socket initialization and listeners
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
      ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:5001' 
        : 'https://zylora-e-commerce.onrender.com');

    const userData = sessionStorage.getItem('user');
    let user = null;
    try {
      user = userData ? JSON.parse(userData) : null;
    } catch (err) {}
    const currentUserId = user?._id || user?.id;

    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRoleRef.current === 'buyer' ? currentUserId : null);
      
      socket.current.emit('join_negotiation', { 
        productId: id, 
        buyerId: targetBuyerId 
      });
    });

    socket.current.on('incoming_call_request', (data) => {
      setIncomingCallRequest(data);
    });

    socket.current.on('call_permission_response', (data) => {
      if (data.allowed) {
        setCallPermission('GRANTED');
      } else {
        setCallPermission('DENIED');
        setTimeout(() => setCallPermission('NONE'), 3000);
      }
    });

    socket.current.on('receive_message', (message) => {
      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRoleRef.current === 'buyer' ? currentUserId : null);

      // Strictly one-on-one: filter out messages from other buyer negotiations
      if (message.buyerId && targetBuyerId && message.buyerId.toString() !== targetBuyerId.toString()) {
        return;
      }

      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const currentId = user?._id || user?.id;
      const isMe = message.sender === currentId;
      const displaySender = isMe ? 'you' : (message.senderRole || (userRoleRef.current === 'seller' ? 'buyer' : 'seller'));

      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, {
          id: message.id || Date.now(),
          sender: displaySender,
          text: message.text,
          type: message.type,
          offerPrice: message.offerPrice,
          time: message.time,
          status: 'received'
        }];
      });
    });

    socket.current.on('price_update', (data) => {
      if (data.agreedPrice !== undefined) setAgreedPrice(data.agreedPrice);
      if (data.quantity !== undefined) setQuantity(data.quantity);
    });

    socket.current.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.current.on('call_accepted', async (signalData) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signalData));
        setCallActive(true);
        setIsCalling(false);
      }
    });

    socket.current.on('ice_candidate', async (candidate) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      }
    });

    socket.current.on('call_ended', () => {
      handleEndCall(false);
    });

    socket.current.on('deal_update', (data) => {
      if (data.status) {
        setDealStatus(data.status);
        if (data.status === 'DECLINED') {
          setLastDeclinedAt(new Date().toISOString());
        } else {
          setLastDeclinedAt(null);
          setCooldownTimeLeft(0);
        }
        if (data.price !== undefined) setAgreedPrice(data.price);
        if (data.quantity !== undefined) setQuantity(data.quantity);
        
        const systemMsg = {
          id: Date.now(),
          sender: 'system',
          text: `${data.sender === 'seller' ? 'Seller' : 'Buyer'} ${data.status === 'AGREED' ? 'accepted' : data.status === 'DECLINED' ? 'declined' : (data.status === 'OFFER_SENT' || data.status === 'COUNTERED') ? 'sent a formal offer for' : 'updated'} the deal at \u20B9${Math.round(data.price * (data.quantity || 1)).toLocaleString()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    });

    socket.current.on('urgent_buzz', (data) => {
      setIncomingBuzz(data);
      
      const playBuzzerSound = async () => {
        try {
          let ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
          if (ctx.state === 'suspended') await ctx.resume();
          const playTone = (freq, startTime, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
          };
          const now = ctx.currentTime;
          for (let burst = 0; burst < 3; burst++) {
            const offset = burst * 0.7;
            for (let i = 0; i < 4; i++) {
              playTone(880, now + offset + i * 0.12, 0.1);
              playTone(660, now + offset + i * 0.12 + 0.06, 0.1);
            }
          }
        } catch (e) {}
      };
      playBuzzerSound();

      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      setTimeout(() => setIncomingBuzz(null), 8000);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [id]);

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (dealStatus === 'DECLINED' && lastDeclinedAt) {
      timer = setInterval(() => {
        const declinedTime = new Date(lastDeclinedAt).getTime();
        const now = new Date().getTime();
        const diffSeconds = Math.floor((now - declinedTime) / 1000);
        const remaining = Math.max(0, 300 - diffSeconds);
        setCooldownTimeLeft(remaining);
      }, 1000);
    } else {
      setCooldownTimeLeft(0);
    }
    return () => clearInterval(timer);
  }, [dealStatus, lastDeclinedAt]);

  const handleSendMessage = (e, textToSubmit = newMessage, type = 'text') => {
    if (e) e.preventDefault();
    if (!textToSubmit.trim()) return;

    const user = JSON.parse(sessionStorage.getItem('user'));
    const senderId = user?._id || user?.id;

    const msg = {
      id: Date.now(),
      sender: 'you',
      text: textToSubmit,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, msg]);
    
    // Emit message to socket
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId');

    if (socket.current) {
      const messageData = {
        productId: id,
        senderId: currentUserId,
        senderRole: userRole,
        buyerId: targetBuyerId,
        text: textToSubmit,
        type: type,
        offerPrice: type === 'offer' ? agreedPrice : undefined,
        quantity: quantity
      };
      socket.current.emit('send_message', messageData);
    }

    setNewMessage('');
  };

  // Emergency Buzzer Handler
  const handleEmergencyBuzz = useCallback(() => {
    if (buzzerCooldown || !socket.current) return;

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentUserId = user?._id || user?.id;
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? currentUserId : null);

    socket.current.emit('urgent_buzz', {
      productId: id,
      buyerId: targetBuyerId,
      buyerName: user?.name || 'Buyer',
      productName: product?.name || 'Product',
      senderId: currentUserId
    });

    // Add system message
    const systemMsg = {
      id: Date.now(),
      sender: 'system',
      text: '🚨 Emergency buzz sent to seller!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setMessages(prev => [...prev, systemMsg]);

    // 30-second cooldown
    setBuzzerCooldown(true);
    setBuzzerCooldownTime(30);
    const interval = setInterval(() => {
      setBuzzerCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBuzzerCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [buzzerCooldown, id, product, userRole]);

  const handleUpdateDealStatus = (status) => {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId');

    setDealStatus(status);
    if (socket.current) {
      const currentUserId = user?._id || user?.id;
      const effectiveBuyerId = targetBuyerId || (userRole === 'buyer' ? currentUserId : null);

      socket.current.emit('deal_update', {
        productId: id,
        status: status,
        price: agreedPrice,
        quantity: quantity,
        sender: userRole,
        senderRole: userRole,
        buyerId: effectiveBuyerId,
        senderId: currentUserId
      });
    }

    // Add a local system message
    const systemMsg = {
      id: Date.now(),
      sender: 'system',
      text: `You ${status === 'AGREED' ? 'accepted' : status === 'DECLINED' ? 'declined' : (status === 'OFFER_SENT' || status === 'COUNTERED') ? 'sent a formal offer for' : 'updated'} the deal at \u20B9${Math.round(agreedPrice * quantity).toLocaleString()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <button onClick={() => navigate(isSeller ? '/seller-negotiations' : '/')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            {isSeller ? 'Back to Negotiations' : 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      {/* Emergency Buzz Overlay */}
      <AnimatePresence>
        {incomingBuzz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)', backdropFilter: 'blur(8px)' }}
            onClick={() => setIncomingBuzz(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.05, 1], 
                opacity: 1,
                x: [0, -8, 8, -8, 8, -4, 4, 0]
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl border-2 border-red-200 p-8 max-w-md w-full mx-4"
              style={{ boxShadow: '0 0 60px rgba(239, 68, 68, 0.3), 0 0 120px rgba(239, 68, 68, 0.1)' }}
            >
              {/* Pulsing red ring */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" style={{ width: '48px', height: '48px' }}></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                    <Bell size={24} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-red-100">
                  <AlertTriangle size={12} />
                  URGENT NOTIFICATION
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-2">
                  🚨 Emergency Buzz!
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-bold text-gray-900">{incomingBuzz.buyerName}</span> needs your urgent attention
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Regarding: <span className="font-semibold text-gray-600">{incomingBuzz.productName}</span>
                </p>

                {/* Animated urgency bars */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-red-500 to-red-400"
                      animate={{ height: [8, 24, 8] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setIncomingBuzz(null)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Acknowledge & Dismiss
                </button>
                <p className="text-[10px] text-gray-400 mt-3 font-medium">Auto-dismisses in 8 seconds</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors mb-6 uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to {product.name}
        </button>

        {/* Product Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100">
              <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {userRole === 'seller' ? 'Buyer: ' : 'Seller: '}
                  <span className="font-bold text-gray-900">
                    {counterParty.name || (userRole === 'seller' ? 'Buyer' : (product.seller?.name || 'Seller'))}
                  </span>
                </span>
                <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {userRole === 'seller' ? 'Verified Buyer' : 'Priority Buyer'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-gray-900">&#8377;{(product.price * quantity).toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Quantity:</div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => {
                    if (quantity > 1) {
                      const newQty = quantity - 1;
                      setQuantity(newQty);
                      if (socket.current) {
                        const searchParams = new URLSearchParams(window.location.search);
                        const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? JSON.parse(sessionStorage.getItem('user'))?._id : null);
                        socket.current.emit('price_update', { productId: id, buyerId: targetBuyerId, quantity: newQty, agreedPrice: agreedPrice });
                      }
                    }
                  }}
                  disabled={dealStatus === 'AGREED' || (dealStatus === 'DECLINED' && cooldownTimeLeft > 0) || userRole === 'seller'}
                  className={`p-1 rounded-md transition-colors ${userRole === 'seller' || (dealStatus === 'DECLINED' && cooldownTimeLeft > 0) ? 'cursor-not-allowed text-gray-300' : 'hover:bg-white text-gray-600 hover:text-blue-600'}`}
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-xs font-black text-gray-900">{quantity}</span>
                <button 
                  onClick={() => {
                    const newQty = quantity + 1;
                    setQuantity(newQty);
                    if (socket.current) {
                      const searchParams = new URLSearchParams(window.location.search);
                      const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? JSON.parse(sessionStorage.getItem('user'))?._id : null);
                      socket.current.emit('price_update', { productId: id, buyerId: targetBuyerId, quantity: newQty, agreedPrice: agreedPrice });
                    }
                  }}
                  disabled={dealStatus === 'AGREED' || (dealStatus === 'DECLINED' && cooldownTimeLeft > 0) || userRole === 'seller'}
                  className={`p-1 rounded-md transition-colors ${userRole === 'seller' || (dealStatus === 'DECLINED' && cooldownTimeLeft > 0) ? 'cursor-not-allowed text-gray-300' : 'hover:bg-white text-gray-600 hover:text-blue-600'}`}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <div className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1">
              &#8377;{product.price.toLocaleString()} per unit
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className={`border rounded-xl p-3 flex items-start gap-3 mb-6 ${
          userRole === 'seller' ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <Info size={16} className={userRole === 'seller' ? 'text-indigo-600 mt-0.5' : 'text-blue-600 mt-0.5'} />
          <p className={`text-[11px] font-medium ${userRole === 'seller' ? 'text-indigo-800' : 'text-blue-800'}`}>
            {userRole === 'seller' 
              ? 'You are negotiating with a potential buyer. All agreed offers will be finalized upon buyer payment.' 
              : 'Negotiating directly with seller. Formal offers are legally binding once accepted by both parties.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              <button 
                type="button" 
                onClick={() => setActiveChatTab('Chat')}
                className={`py-4 px-4 border-b-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${activeChatTab === 'Chat' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              >
                <Send size={14} className="rotate-45 -mt-1" /> Chat
              </button>
              
              {callPermission === 'GRANTED' ? (
                <button 
                  type="button" 
                  onClick={handleStartCall}
                  className="py-4 px-4 border-b-2 border-green-500 text-green-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-bounce"
                >
                  <Phone size={14} /> Call Now
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleRequestCallPermission('voice')}
                  disabled={callPermission === 'REQUESTING'}
                  className={`py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${callPermission === 'REQUESTING' ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <Phone size={14} /> 
                  {callPermission === 'REQUESTING' ? 'Requesting...' : callPermission === 'DENIED' ? 'Call Denied' : 'Voice Call'}
                </button>
              )}

              <button type="button" className="py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Video size={14} /> Video
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB]/50">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.isSystem ? 'justify-center' : msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.isSystem ? (
                      <div className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-gray-200">
                        {msg.text} • {msg.time}
                      </div>
                    ) : (
                      <div className={`max-w-[80%] ${msg.sender === 'you' ? 'order-2' : ''}`}>
                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                          msg.sender === 'you' 
                            ? 'bg-[#1E293B] text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                          {msg.sender !== 'you' && (
                            <span className="text-gray-900 font-black">
                              {userRole === 'seller' ? 'BUYER' : 'SELLER'}
                            </span>
                          )}
                          <span>{msg.time}</span>
                          {msg.sender === 'you' && (
                            <span className={msg.status === 'read' ? 'text-blue-500' : 'text-gray-300'}>
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100 space-y-4">
              {dealStatus === 'PENDING' ? (
                <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-amber-800 text-sm font-bold mb-3">
                    {userRole === 'buyer' 
                      ? 'Waiting for the seller to accept your negotiation request...' 
                      : 'The buyer has requested to negotiate.'}
                  </p>
                  {userRole === 'seller' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateDealStatus('ACCEPTED')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        Accept Request
                      </button>
                      <button 
                        onClick={() => handleUpdateDealStatus('DECLINED')}
                        className="bg-white text-gray-600 border border-gray-300 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={(dealStatus === 'NEW' && userRole === 'buyer') ? "Send a message to start negotiating..." : "Type your message..."}
                        disabled={dealStatus === 'DECLINED' && cooldownTimeLeft > 0}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <Paperclip size={20} />
                      </button>
                    </div>
                    <button 
                      type="submit"
                      disabled={dealStatus === 'DECLINED'}
                      className="bg-[#0A1628] text-white p-3 rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-200 disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>

                    {/* Emergency Buzz Button — Buyer Only */}
                    {userRole === 'buyer' && (dealStatus !== 'DECLINED' || cooldownTimeLeft <= 0) && (
                      <button
                        type="button"
                        onClick={handleEmergencyBuzz}
                        disabled={buzzerCooldown}
                        title={buzzerCooldown ? `Wait ${buzzerCooldownTime}s` : 'Send urgent buzz to seller'}
                        className={`relative p-3 rounded-xl transition-all shadow-lg ${
                          buzzerCooldown 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-gray-100' 
                            : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/30 hover:shadow-red-500/50'
                        }`}
                      >
                        {!buzzerCooldown && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                          </span>
                        )}
                        {buzzerCooldown ? (
                          <span className="text-xs font-black w-5 h-5 flex items-center justify-center">{buzzerCooldownTime}</span>
                        ) : (
                          <Bell size={20} />
                        )}
                      </button>
                    )}
                  </form>
                  {dealStatus !== 'NEW' && (
                    <button 
                      type="button"
                      onClick={() => handleUpdateDealStatus(userRole === 'seller' ? 'OFFER_SENT' : 'COUNTERED')}
                      disabled={dealStatus === 'DECLINED'}
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 ${
                      userRole === 'seller' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' 
                        : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
                    }`}>
                      <ShieldCheck size={16} /> {userRole === 'seller' ? `Send Formal Offer (\u20B9${Math.round(agreedPrice * quantity).toLocaleString()})` : `Send Formal Offer (\u20B9${Math.round(agreedPrice * quantity).toLocaleString()})`}
                    </button>
                  )}
                </>
              )}
              </div>
            </div>
  
            {/* Sidebar Section */}
            <div className="lg:col-span-4 space-y-6">
              {/* Negotiation Status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-serif text-xl font-bold italic">Negotiation Status</h3>
                  <span className={`text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 ${
                    dealStatus === 'AGREED' ? 'bg-green-500' : 
                    dealStatus === 'OFFER_SENT' ? 'bg-indigo-500' :
                    dealStatus === 'DECLINED' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}>
                    <CheckCircle size={10} /> {dealStatus}
                  </span>
                </div>
  
                <div className="space-y-6">
                  <div className="group relative">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Agreed Price</div>
                    <div className="flex items-center gap-1 relative">
                      <span className="text-2xl font-serif font-black text-gray-900">&#8377;</span>
                      <input 
                        type="text"
                        value={Math.round(agreedPrice * quantity)}
                        disabled={dealStatus === 'AGREED' || (dealStatus === 'DECLINED' && cooldownTimeLeft > 0)}
                        onChange={(e) => {
                           const val = e.target.value.replace(/\D/g, '');
                           const newTotalPrice = Number(val);
                           const newUnitPrice = newTotalPrice / quantity;
                           setAgreedPrice(newUnitPrice);
                           if (socket.current) {
                             const searchParams = new URLSearchParams(window.location.search);
                             const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? JSON.parse(sessionStorage.getItem('user'))?._id : null);
                             
                             socket.current.emit('price_update', {
                               productId: id,
                               buyerId: targetBuyerId,
                               agreedPrice: newUnitPrice,
                               quantity: quantity
                             });
                           }
                        }}
                        className={`w-full text-4xl font-serif font-black tracking-tighter ${dealStatus === 'AGREED' ? 'text-gray-500' : 'text-gray-900'} focus:outline-none focus:ring-0 bg-transparent border-none p-0 m-0`}
                      />
                      {dealStatus !== 'AGREED' && (dealStatus !== 'DECLINED' || cooldownTimeLeft <= 0) && (
                        <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className={`h-[2px] w-full ${dealStatus === 'AGREED' ? 'bg-gray-100' : 'bg-gray-100 group-focus-within:bg-blue-600'} transition-colors mt-1`}></div>
                  </div>
  
                  <div className={`rounded-xl p-4 flex items-center justify-between border ${
                    userRole === 'seller' ? 'bg-indigo-50 border-indigo-100' : 'bg-[#F0FDF4] border-[#DCFCE7]'
                  }`}>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                        userRole === 'seller' ? 'text-indigo-700/60' : 'text-green-700/60'
                      }`}>
                        {userRole === 'seller' ? 'Total Discount' : 'Total Savings'}
                      </div>
                      <div className={`text-lg font-black ${userRole === 'seller' ? 'text-indigo-600' : 'text-green-600'}`}>
                        &#8377;{(Math.abs(product.price - agreedPrice) * quantity).toLocaleString()} ({( ((product.price - agreedPrice)/product.price)*100 ).toFixed(1)}% {product.price > agreedPrice ? 'OFF' : 'ABOVE'})
                      </div>
                      <div className="text-[10px] font-bold opacity-60 mt-1">
                        &#8377;{Math.abs(product.price - agreedPrice).toLocaleString()} per unit
                      </div>
                    </div>
                    <div className={userRole === 'seller' ? 'text-indigo-500' : 'text-green-500'}>
                      <Tag size={24} />
                    </div>
                  </div>
  
                <div className="space-y-3 pt-4">
                  {userRole === 'buyer' ? (
                    <>
                      {dealStatus === 'AGREED' ? (
                        <button 
                          type="button"
                          onClick={() => {
                            navigate('/checkout', { state: { price: agreedPrice, product: product, quantity: quantity } });
                          }}
                          className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20"
                        >
                          <ShoppingCart size={16} /> Proceed to Pay
                        </button>
                      ) : dealStatus === 'OFFER_SENT' ? (
                        <button 
                          type="button"
                          onClick={() => {
                            handleUpdateDealStatus('AGREED');
                            setTimeout(() => {
                              navigate('/checkout', { state: { price: agreedPrice, product: product, quantity: quantity } });
                            }, 500);
                          }}
                          className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20"
                        >
                          <ShoppingCart size={16} /> Accept Seller's Offer & Pay
                        </button>
                      ) : dealStatus === 'DECLINED' ? (
                        <div className="space-y-3">
                          <button 
                            type="button"
                            onClick={() => {
                              navigate('/checkout', { state: { price: product.price, product: product, quantity: quantity } });
                            }}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                          >
                            <ShoppingCart size={16} /> Buy at Original Price (&#8377;{product.price.toLocaleString()})
                          </button>
                          {cooldownTimeLeft > 0 ? (
                             <button 
                              type="button"
                              disabled={true}
                              className="w-full bg-gray-100 text-red-500 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100"
                            >
                              <AlertTriangle size={16} /> Cooldown: {Math.floor(cooldownTimeLeft / 60)}:{(cooldownTimeLeft % 60).toString().padStart(2, '0')}
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                handleUpdateDealStatus('PENDING');
                                setAgreedPrice(product.price * 0.9);
                              }}
                              className="w-full bg-amber-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                            >
                              <Edit2 size={16} /> Negotiate Again
                            </button>
                          )}
                        </div>
                      ) : (
                        <button 
                          type="button"
                          disabled={true}
                          className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          Waiting for Seller's Agreement
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {dealStatus === 'COUNTERED' ? (
                        <button 
                          type="button"
                          onClick={() => handleUpdateDealStatus('AGREED')}
                          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <CheckCircle size={16} /> Accept Buyer's Offer
                        </button>
                      ) : dealStatus === 'AGREED' ? (
                        <button 
                          type="button"
                          disabled={true}
                          className="w-full bg-green-100 text-green-700 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} /> Deal Agreed
                        </button>
                      ) : (
                         <button 
                          type="button"
                          disabled={true}
                          className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          Waiting for Buyer's Response
                        </button>
                      )}
                    </>
                  )}
                  <button 
                    type="button"
                    onClick={() => handleUpdateDealStatus('DECLINED')}
                    disabled={dealStatus === 'DECLINED' && cooldownTimeLeft > 0}
                    className="w-full bg-white text-gray-400 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft size={16} className="rotate-45" /> Decline Deal
                  </button>
                  {dealStatus === 'DECLINED' && cooldownTimeLeft > 0 && (
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        Cooldown Active: {Math.floor(cooldownTimeLeft / 60)}:{(cooldownTimeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium text-center">
                        The seller declined the deal. You can try again after the cooldown period.
                      </p>
                    </div>
                  )}
                </div>

                {/* Negotiation Log */}
                <div className="pt-8 border-t border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Negotiation Log</div>
                  <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                    {messages.filter(m => m.isSystem).length > 0 ? (
                      messages.filter(m => m.isSystem).reverse().map((log) => {
                        const logTextLower = log.text.toLowerCase();
                        const isAgreed = logTextLower.includes('accepted') || logTextLower.includes('agreed');
                        const isDeclined = logTextLower.includes('declined');
                        const isCounter = logTextLower.includes('countered');
                        
                        let title = 'Offer Sent';
                        if (isAgreed) title = 'Deal Finalized';
                        if (isDeclined) title = 'Deal Declined';
                        if (isCounter) title = 'Counter-offer';

                        return (
                          <div key={log.id} className="flex gap-4 relative">
                            <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
                              isAgreed ? 'bg-green-500' : isDeclined ? 'bg-red-500' : 'bg-blue-500/50'
                            }`}></div>
                            <div>
                              <div className="text-[11px] font-black text-gray-900 leading-none">
                                {title}
                              </div>
                              <div className="text-[9px] font-medium text-gray-400 mt-1 uppercase">
                                {log.time} • {log.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex gap-4 relative">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm z-10"></div>
                        <div>
                          <div className="text-[11px] font-black text-gray-900 leading-none">Negotiation Started</div>
                          <div className="text-[9px] font-medium text-gray-400 mt-1 uppercase">
                            Status: {dealStatus} • Price: &#8377;{agreedPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller/Buyer Card */}
            <div className={`rounded-2xl p-6 text-white shadow-sm ${
              userRole === 'seller' ? 'bg-[#4F46E5]' : 'bg-[#0A1628]'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-gray-900 text-lg uppercase">
                  {counterParty.initial || (userRole === 'seller' ? 'B' : 'S')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">
                      {counterParty.name || (userRole === 'seller' ? 'Buyer' : 'Seller')} (Verified)
                    </h4>
                    <div className="flex text-amber-500">
                      {[1,2,3,4,5].map(s => <Check key={s} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-100/80 leading-relaxed font-medium italic">
                {userRole === 'seller' 
                  ? '"Buyer since 2023. 100% successful payment rate. Priority member of ZyLora Prime."'
                  : '"Specializing in certified refurbished electronics with 12-month standard warranty. 98% positive feedback."'
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Call UI Components */}
      <AnimatePresence>
        {incomingCallRequest && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 z-[100] bg-white border border-blue-100 shadow-2xl rounded-2xl p-6 w-80"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <Bell size={24} className="animate-tada" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Call Request</h3>
              <p className="text-xs text-gray-500 mb-6">{incomingCallRequest.name} wants to start a voice call with you.</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => handleRespondCallPermission(true)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Allow
                </button>
                <button 
                  onClick={() => handleRespondCallPermission(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 w-80"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-pulse">
                <Phone size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Incoming Voice Call</h3>
              <p className="text-sm text-gray-500 mb-6">{incomingCall.name} is calling you...</p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleEndCall(true)}
                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(isCalling || callActive) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-3xl p-10 flex flex-col items-center text-center text-white">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <Phone size={40} />
                </div>
                {callActive && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500 rounded-full -z-10"
                  />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {isCalling ? 'Calling Seller...' : 'Active Call'}
              </h2>
              <p className="text-blue-200/60 text-sm mb-12">
                {isCalling ? 'Connecting secure line...' : 'Secure end-to-end encrypted voice session'}
              </p>

              <div className="flex gap-6">
                <button 
                  onClick={() => handleEndCall(true)}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl shadow-red-500/30"
                >
                  <PhoneOff size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remote Audio Element */}
      <audio 
        ref={(el) => {
          if (el && remoteStream) {
            el.srcObject = remoteStream;
            el.play().catch(e => console.error('Audio play error:', e));
          }
        }} 
        autoPlay 
      />

      {/* Footer (Simplified) */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">ZyLora</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Redefining the agricultural and electronic marketplace through transparent negotiations and secure auctions.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Marketplace</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">About Zylora</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Terms of Service</li>
              <li className="hover:text-amber-500 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Auction Rules</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              {/* Add social icons here if needed */}
            </div>
            <p className="text-[8px] text-gray-500 mt-4 uppercase tracking-widest font-black">© 2024 ZYLORA. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Negotiation;
