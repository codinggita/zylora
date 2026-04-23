import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Heart, ShoppingCart, User, 
  LogOut, Menu, Send, Paperclip, Phone, Video, 
  CheckCircle, Clock, ShieldCheck, Tag, Info,
  Check
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { io } from 'socket.io-client';

const Negotiation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const product = products.find(p => p.id === parseInt(id)) || products[0];
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'you', text: "Hello, I'm interested in the " + product.name + ". Would you consider ₹" + (product.price * 0.85).toLocaleString() + " for a quick deal?", time: '10:45 AM', status: 'read' },
    { id: 2, sender: 'seller', text: "Hi! Thanks for reaching out. ₹" + (product.price * 0.85).toLocaleString() + " is a bit low given the condition. How about ₹" + (product.price * 0.95).toLocaleString() + "?", time: '10:48 AM' },
    { id: 3, sender: 'you', text: "Can we meet in the middle at ₹" + (product.price * 0.9).toLocaleString() + "? I can complete the payment immediately.", time: '10:52 AM', status: 'read' },
    { id: 4, sender: 'seller', text: "I agree to ₹" + (product.price * 0.9).toLocaleString() + ". It's a fair price. Sending over the formal offer now.", time: '10:55 AM' },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [dealStatus, setDealStatus] = useState('DEAL AGREED'); // PENDING, COUNTERED, AGREED
  const [agreedPrice, setAgreedPrice] = useState(product.price * 0.9);
  const chatEndRef = useRef(null);
  const socket = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Determine backend URL
    const BACKEND_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://zylora-3.onrender.com';

    // Initialize socket
    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, { ...message, sender: 'seller' }]);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      sender: 'you',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, msg]);
    
    // Emit message to socket
    if (socket.current) {
      socket.current.emit('send_message', {
        productId: id,
        text: newMessage,
        sender: 'buyer'
      });
    }

    setNewMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white">
              <Menu size={18} /> Categories
            </button>
          </div>
          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="hidden md:flex items-center gap-4">
              <Heart size={20} className="cursor-pointer hover:text-white" />
              <User size={20} className="cursor-pointer hover:text-white" />
              <div className="relative cursor-pointer hover:text-white text-amber-500" onClick={() => navigate('/cart')}>
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-amber-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <button 
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
                <span className="text-xs text-gray-500">Seller: <span className="font-bold text-gray-900">{product.seller?.name || 'TechZone'}</span></span>
                <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Priority Buyer</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-gray-900">₹{product.price.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: 1 Unit</div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3 mb-6">
          <Info size={16} className="text-blue-600 mt-0.5" />
          <p className="text-[11px] text-blue-800 font-medium">
            Negotiating directly with seller. Formal offers are legally binding once accepted by both parties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              <button className="py-4 px-4 border-b-2 border-gray-900 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Send size={14} className="rotate-45 -mt-1" /> Chat
              </button>
              <button className="py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Voice
              </button>
              <button className="py-4 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
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
                    className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.sender === 'you' ? 'order-2' : ''}`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                        msg.sender === 'you' 
                          ? 'bg-[#1E293B] text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'seller' && <span className="text-gray-900 font-black">{product.seller?.name || 'TECHZONE'}</span>}
                        <span>{msg.time}</span>
                        {msg.sender === 'you' && (
                          <span className={msg.status === 'read' ? 'text-blue-500' : 'text-gray-300'}>
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100 space-y-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Paperclip size={20} />
                  </button>
                </div>
                <button 
                  type="submit"
                  className="bg-[#0A1628] text-white p-3 rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-200"
                >
                  <Send size={20} />
                </button>
              </form>
              <button className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">
                <ShieldCheck size={16} /> Send Formal Offer
              </button>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Negotiation Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-xl font-bold italic">Negotiation Status</h3>
                <span className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle size={10} /> {dealStatus}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Agreed Price</div>
                  <div className="text-4xl font-serif font-black tracking-tighter">₹{agreedPrice.toLocaleString()}</div>
                </div>

                <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-green-700/60 uppercase tracking-widest mb-0.5">Total Savings</div>
                    <div className="text-lg font-black text-green-600">₹{(product.price - agreedPrice).toLocaleString()} ({( ((product.price - agreedPrice)/product.price)*100 ).toFixed(1)}% OFF)</div>
                  </div>
                  <div className="text-green-500">
                    <Tag size={24} />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => navigate('/checkout', { state: { price: agreedPrice } })}
                    className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20"
                  >
                    <ShoppingCart size={16} /> Accept & Proceed to Pay
                  </button>
                  <button className="w-full bg-white text-gray-400 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
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

            {/* Seller Card */}
            <div className="bg-[#0A1628] rounded-2xl p-6 text-white shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-gray-900 text-lg">
                  TZ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">TechZone Verified</h4>
                    <div className="flex text-amber-500">
                      {[1,2,3,4,5].map(s => <Check key={s} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium italic">
                "Specializing in certified refurbished electronics with 12-month standard warranty. 98% positive feedback."
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
