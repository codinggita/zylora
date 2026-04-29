import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Phone, Video, Check, 
  Paperclip, ShieldCheck, Edit2, CheckCircle,
  Info, ShoppingCart, Tag
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
  
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [dealStatus, setDealStatus] = useState(null); // null until fetched, then PENDING, ACCEPTED, etc.
  const [agreedPrice, setAgreedPrice] = useState(0);
  const chatEndRef = useRef(null);
  const socket = useRef(null);
  const [userRole, setUserRole] = useState('buyer');
  const isSeller = userRole === 'seller';

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
    // Improved user data parsing with fallback
    const userData = sessionStorage.getItem('user');
    let user = null;
    try {
      user = userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error('Error parsing user data:', err);
    }

    let currentUserId = null;
    if (user) {
      const role = user.role || 'buyer';
      setUserRole(role);
      userRoleRef.current = role;
      currentUserId = user._id || user.id;
    } else {
      // Fallback if no user is found
      setUserRole('buyer');
      userRoleRef.current = 'buyer';
    }

    const BACKEND_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : 'https://zylora-3.onrender.com';

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
              if (chatRes.data.negotiation.agreedPrice) {
                setAgreedPrice(chatRes.data.negotiation.agreedPrice);
              }
            } else {
              setDealStatus('NEW');
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

    // Initialize socket
    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      const searchParams = new URLSearchParams(window.location.search);
      const targetBuyerId = searchParams.get('buyerId') || (userRoleRef.current === 'buyer' ? currentUserId : null);
      
      socket.current.emit('join_negotiation', { 
        productId: id, 
        buyerId: targetBuyerId 
      });
    });

    socket.current.on('receive_message', (message) => {
      console.log('Message received from socket:', message);
      const isMe = message.sender === currentUserId;
      const displaySender = isMe ? 'you' : (userRole === 'seller' ? 'buyer' : 'seller');

      setMessages(prev => [...prev, {
        id: message.id || Date.now(),
        sender: displaySender,
        text: message.text,
        type: message.type,
        offerPrice: message.offerPrice,
        time: message.time,
        status: 'received'
      }]);
    });

    socket.current.on('price_update', (data) => {
      console.log('Price update received:', data);
      if (data.agreedPrice !== undefined) {
        setAgreedPrice(data.agreedPrice);
      }
    });

    socket.current.on('deal_update', (data) => {
      console.log('Deal update received:', data);
      if (data.status) {
        setDealStatus(data.status);
        
        // Add a system message to the chat
        const systemMsg = {
          id: Date.now(),
          sender: 'system',
          text: `Deal status updated to: ${data.status} at ₹${data.price}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = JSON.parse(sessionStorage.getItem('user'));
    const senderId = user?._id || user?.id;

    const msg = {
      id: Date.now(),
      sender: 'you',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, msg]);
    
    // Emit message to socket
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId');

    if (socket.current) {
      socket.current.emit('send_message', {
        productId: id,
        text: newMessage,
        senderId: senderId,
        buyerId: targetBuyerId,
        senderRole: user?.role || 'buyer',
        type: 'text'
      });
    }

    setNewMessage('');
  };

  const handleUpdateDealStatus = (status) => {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const searchParams = new URLSearchParams(window.location.search);
    const targetBuyerId = searchParams.get('buyerId');

    setDealStatus(status);
    if (socket.current) {
      socket.current.emit('deal_update', {
        productId: id,
        status: status,
        price: agreedPrice,
        sender: userRole,
        senderRole: userRole,
        buyerId: targetBuyerId,
        senderId: user?._id || user?.id
      });
    }

    // Add a local system message
    const systemMsg = {
      id: Date.now(),
      sender: 'system',
      text: `You ${status === 'AGREED' ? 'accepted' : status === 'DECLINED' ? 'declined' : status === 'OFFER_SENT' ? 'sent a formal offer' : 'updated'} the deal at ₹${agreedPrice}`,
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
                    {userRole === 'seller' ? 'Direct Buyer' : (product.seller?.name || 'TechZone')}
                  </span>
                </span>
                <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {userRole === 'seller' ? 'Verified Buyer' : 'Priority Buyer'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-gray-900">₹{product.price.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: 1 Unit</div>
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
              <button type="button" className="py-4 px-4 border-b-2 border-gray-900 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Send size={14} className="rotate-45 -mt-1" /> Chat
              </button>
              <button type="button" className="py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Voice
              </button>
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
                        disabled={dealStatus === 'DECLINED'}
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
                      <ShieldCheck size={16} /> {userRole === 'seller' ? 'Send Formal Offer' : 'Send Formal Offer'}
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
                      <span className="text-2xl font-serif font-black text-gray-900">₹</span>
                      <input 
                        type="number"
                        value={agreedPrice}
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          setAgreedPrice(newPrice);
                          if (socket.current) {
                            const searchParams = new URLSearchParams(window.location.search);
                            const targetBuyerId = searchParams.get('buyerId') || (userRole === 'buyer' ? JSON.parse(sessionStorage.getItem('user'))?._id : null);
                            
                            socket.current.emit('price_update', {
                              productId: id,
                              buyerId: targetBuyerId,
                              agreedPrice: newPrice
                            });
                          }
                        }}
                        className="w-full text-4xl font-serif font-black tracking-tighter text-gray-900 focus:outline-none focus:ring-0 bg-transparent border-none p-0 appearance-none m-0"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={14} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="h-[2px] w-full bg-gray-100 group-focus-within:bg-blue-600 transition-colors mt-1"></div>
                  </div>
  
                  <div className={`rounded-xl p-4 flex items-center justify-between border ${
                    userRole === 'seller' ? 'bg-indigo-50 border-indigo-100' : 'bg-[#F0FDF4] border-[#DCFCE7]'
                  }`}>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                        userRole === 'seller' ? 'text-indigo-700/60' : 'text-green-700/60'
                      }`}>
                        {userRole === 'seller' ? 'Discount Offered' : 'Total Savings'}
                      </div>
                      <div className={`text-lg font-black ${userRole === 'seller' ? 'text-indigo-600' : 'text-green-600'}`}>
                        ₹{(Math.abs(product.price - agreedPrice)).toFixed(2)} ({( ((product.price - agreedPrice)/product.price)*100 ).toFixed(1)}% {product.price > agreedPrice ? 'OFF' : 'ABOVE'})
                      </div>
                    </div>
                    <div className={userRole === 'seller' ? 'text-indigo-500' : 'text-green-500'}>
                      <Tag size={24} />
                    </div>
                  </div>
  
                <div className="space-y-3 pt-4">
                  {userRole === 'buyer' ? (
                    <button 
                      type="button"
                      onClick={() => {
                        if (dealStatus === 'AGREED') {
                          navigate('/checkout', { state: { price: agreedPrice, product: product } });
                        } else {
                          handleUpdateDealStatus('AGREED');
                          // Also navigate immediately after agreeing
                          setTimeout(() => {
                            navigate('/checkout', { state: { price: agreedPrice, product: product } });
                          }, 500);
                        }
                      }}
                      className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20"
                    >
                      <ShoppingCart size={16} /> {dealStatus === 'AGREED' ? 'Proceed to Pay' : 'Accept & Proceed'}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleUpdateDealStatus('AGREED')}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <CheckCircle size={16} /> Confirm Offer to Buyer
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => handleUpdateDealStatus('DECLINED')}
                    className="w-full bg-white text-gray-400 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} className="rotate-45" /> Decline Deal
                  </button>
                </div>

                {/* Negotiation Log */}
                <div className="pt-8 border-t border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Negotiation Log</div>
                  <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                    <div className="flex gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm z-10"></div>
                      <div>
                        <div className="text-[11px] font-black text-gray-900 leading-none">Deal Finalized</div>
                        <div className="text-[9px] font-medium text-gray-400 mt-1 uppercase">10:55 AM • Seller accepted ₹{agreedPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 border-4 border-white shadow-sm z-10"></div>
                      <div>
                        <div className="text-[11px] font-black text-gray-400 leading-none">Counter-offer sent</div>
                        <div className="text-[9px] font-medium text-gray-400 mt-1 uppercase">10:52 AM • Buyer proposed ₹{agreedPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 border-4 border-white shadow-sm z-10"></div>
                      <div>
                        <div className="text-[11px] font-black text-gray-400 leading-none">Counter-offer received</div>
                        <div className="text-[9px] font-medium text-gray-400 mt-1 uppercase">10:48 AM • Seller proposed ₹{(product.price * 0.95).toLocaleString()}</div>
                      </div>
                    </div>
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
                  {userRole === 'seller' ? 'DB' : 'TZ'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">
                      {userRole === 'seller' ? 'Direct Buyer (Verified)' : 'TechZone Verified'}
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
