import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Clock, Star, ShieldCheck, 
  Truck, RotateCcw, Headset, ArrowRight,
  Gavel, Info, Filter, ArrowUpRight, CheckCircle2, MapPin, TrendingUp,
  Bell, Award, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';

const AgriAuctions = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [activeFilter, setActiveFilter] = useState('All Produce');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [now, setNow] = useState(new Date());
  const [userBidInfo, setUserBidInfo] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');
  const [winnerNotifications, setWinnerNotifications] = useState([]);
  const [promotedProducts, setPromotedProducts] = useState([]);
  const socketRef = React.useRef(null);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  const fetchAuctions = async () => {
    try {
      console.log(`Fetching auctions from: ${BACKEND_URL}/api/auctions`);
      const res = await axios.get(`${BACKEND_URL}/api/auctions`, {
        timeout: 5000
      });
      console.log('Auctions fetched:', res.data);
      if (res.data.success) {
        setAuctions(res.data.data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching auctions:', err.message);
      setError(`Failed to fetch auctions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has won any auctions
  useEffect(() => {
    const checkWinnerStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Check each auction for winner status
        const completedAuctions = auctions.filter(a => a.status === 'COMPLETED' || a.endTime < new Date());
        
        const notifications = await Promise.all(
          completedAuctions.map(async (auction) => {
            try {
              const res = await axios.get(
                `${BACKEND_URL}/api/auctions/${auction._id}/winner-status`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return res.data.data;
            } catch (e) {
              return null;
            }
          })
        );

        setWinnerNotifications(notifications.filter(n => n && n.isWinner && !n.orderCreated));
      } catch (err) {
        console.error('Error checking winner status:', err);
      }
    };

    if (auctions.length > 0) {
      checkWinnerStatus();
    }
  }, [auctions, BACKEND_URL]);

  useEffect(() => {
    fetchAuctions();

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchAuctions();
    }, 5000);

    // Initialize socket
    const socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to auction socket');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from auction socket');
    });

    socket.on('auction_bid_updated', (data) => {
      console.log('Real-time bid update received:', data);
      setAuctions(prev => prev.map(auction => 
        auction._id === data.auctionId 
          ? { 
              ...auction, 
              currentBid: data.currentBid, 
              bids: data.bids, 
              highestBidder: data.highestBidder,
              userPayments: data.userPayments || auction.userPayments
            }
          : auction
      ));

      if (selectedAuction && selectedAuction._id === data.auctionId) {
        setSelectedAuction(prev => ({ 
          ...prev, 
          currentBid: data.currentBid, 
          bids: data.bids, 
          highestBidder: data.highestBidder,
          userPayments: data.userPayments || prev.userPayments
        }));
      }
    });

    return () => {
      clearInterval(pollInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Manage room joins separately
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || auctions.length === 0) return;

    const joinRooms = () => {
      auctions.forEach(auction => {
        socket.emit('join_auction', auction._id);
        console.log(`Joined room: auction_${auction._id}`);
      });
    };

    if (socket.connected) {
      joinRooms();
    } else {
      socket.on('connect', joinRooms);
    }

    return () => {
      if (socket) {
        auctions.forEach(auction => {
          socket.emit('leave_auction', auction._id);
        });
        socket.off('connect', joinRooms);
      }
    };
  }, [auctions.length]); // Only re-run when the number of auctions changes

  // Update 'now' every second for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculatePayment = (newBidAmount) => {
    if (!selectedAuction) return null;
    
    const minBid = selectedAuction.currentBid + 1;
    
    if (newBidAmount < minBid) {
      setError(`Bid must be at least ?${minBid}`);
      return null;
    }

    let amountToPay = newBidAmount;
    let isRebid = false;
    let previousBidAmount = 0;

    if (userBidInfo && userBidInfo.hasBid) {
      previousBidAmount = userBidInfo.currentBid;
      amountToPay = newBidAmount - previousBidAmount;
      isRebid = true;
    }

    return { 
      amountToPay, 
      isRebid, 
      bidAmount: newBidAmount,
      previousBidAmount,
      totalWillBePaid: newBidAmount
    };
  };

  const handleBidChange = (e) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setBidAmount(e.target.value);

    if (newAmount > 0) {
      const payment = calculatePayment(newAmount);
      if (payment) {
        setPaymentInfo(payment);
        setError('');
      }
    } else {
      setPaymentInfo(null);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= selectedAuction.currentBid) {
      setError(`Bid must be higher than ?${selectedAuction.currentBid}`);
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auctions/${selectedAuction._id}/bid`, {
        amount: Number(bidAmount)
      }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setShowBidModal(false);
        setBidAmount('');
        setPaymentInfo(null);
        setError('');
        setUserBidInfo(null);
        fetchAuctions();
        alert(res.data.message || 'Bid placed successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    }
  };

  const fetchUserBidInfo = async (auctionId) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auctions/${auctionId}/my-bid`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setUserBidInfo(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching user bid info:', err);
    }
  };

  const filters = ['All Produce', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Organic Certified', 'Export Quality'];

  const liveBids = [
    { id: 1, user: 'Sunil Traders', amount: 1850, time: '2 mins ago' },
    { id: 2, user: 'Global Fresh Exports', amount: 1825, time: '5 mins ago' },
    { id: 3, user: 'Mandi King Co.', amount: 1800, time: '8 mins ago' },
    { id: 4, user: 'Freshway Marts', amount: 1750, time: '12 mins ago' },
  ];

  const closedAuctions = [
    { commodity: 'Kashmiri Apples (Box)', seller: 'Valley Orchards', finalBid: 1250, volume: '800 Boxes', status: 'SOLD' },
    { commodity: 'Soybean Grains', seller: 'Indore Agri Coop', finalBid: 5100, volume: '45 Tons', status: 'SOLD' },
    { commodity: 'Green Grapes (Seedless)', seller: 'Sangli Exports', finalBid: 95, volume: '12 Tons', status: 'UNSOLD' },
    { commodity: 'Organic Coffee Beans', seller: 'Coorg Estates', finalBid: 38000, volume: '2 Tons', status: 'SOLD' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">Agri Auctions</span>
        </div>

        {/* Winner Notifications */}
        <AnimatePresence>
          {winnerNotifications.map((notification, idx) => (
            <motion.div
              key={notification.product.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <Award className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">🎉 Congratulations! You won the auction!</p>
                  <p className="text-sm text-gray-600">
                    <strong>{notification.product.name}</strong> - Winning bid: <strong>&#8377;{notification.winningBid}</strong>
                  </p>
                  {notification.nextStep === 'SUBMIT_ADDRESS' && (
                    <p className="text-xs text-amber-700 mt-1">⚠️ Please submit your delivery address to complete the purchase</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (notification.nextStep === 'SUBMIT_ADDRESS') {
                    navigate(`/auction/${notification.product._id || Object.keys(auctions)[0]}/submit-address`);
                  } else if (notification.nextStep === 'CREATE_ORDER') {
                    navigate(`/auction/${notification.product._id || Object.keys(auctions)[0]}/confirm-order`);
                  }
                }}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition whitespace-nowrap ml-4"
              >
                Complete Purchase →
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-900 to-green-700 h-[300px] mb-8"
        >
          <img 
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1200" 
            alt="Agri Auctions" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
          <div className="absolute inset-0 p-12 flex items-center justify-between">
            <div className="max-w-lg space-y-6">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Live Now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">ZyLora Fresh Auctions</h1>
              <p className="text-green-50 text-sm font-medium leading-relaxed">
                Direct from premium Bharat farms. Real-time bidding for wholesale quantities of seasonal harvests.
              </p>
              <div className="bg-green-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <Info size={16} className="text-green-400 mt-0.5" />
                <p className="text-[10px] text-green-100/80 font-medium">
                  All auction prices are inclusive of mandi tax where applicable. Transportation cost to be calculated post-win.
                </p>
              </div>
            </div>
            <div className="hidden lg:block w-72 h-72 rounded-2xl overflow-hidden rotate-3 shadow-2xl border-8 border-white/10">
              <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600" alt="Fresh Produce" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter 
                  ? 'bg-[#0A1628] text-white shadow-lg' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Featured Auction */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col md:row"
            >
              <div className="md:w-2/5 relative">
                <img 
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600" 
                  alt="Featured" 
                  className="w-full h-full object-cover min-h-[250px]"
                />
                <div className="absolute top-4 left-4 bg-[#0A1628] text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Featured Harvest</div>
              </div>
              <div className="p-8 flex-1 relative">
                  <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">
                    <Clock size={14} className="animate-pulse" />
                    <span className="text-xs font-black font-mono tracking-widest">
                      {(() => {
                        const featuredAuction = auctions.find(a => a.isFeatured) || auctions[0];
                        if (!featuredAuction) return '00:00:00';
                        const diff = new Date(featuredAuction.endTime) - now;
                        if (diff <= 0) return 'ENDED';
                        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                        return `${h}:${m}:${s}`;
                      })()}
                    </span>
                  </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif font-black text-gray-900 leading-tight">
                    Large Alphonso Mangoes (Grade A)
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <MapPin size={14} />
                    <span>Ratnagiri, Maharashtra • 50 Crates</span>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Highest Bid</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-green-600">&#8377;1,850</span>
                        <span className="text-xs font-bold text-gray-400">/ Crate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900 mb-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        24 Active Bidders
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lot Size: 2500 Units</span>
                    </div>
                  </div>
                  <button className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20 mt-4">
                    Place Bid Now
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Ticker Bar */}
            <div className="bg-[#10B981] text-white rounded-2xl p-4 flex items-center gap-6 overflow-hidden relative">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ending in next hour</span>
              </div>
              <div className="flex gap-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest animate-marquee">
                <span>🌾 Basmati Paddy (200 Tons) • 04:12</span>
                <span>🍅 Hybrid Tomatoes (50 Qntls) • 12:45</span>
                <span>🍠 Organic Turmeric (10 Tons) • 32:10</span>
                <span>🧅 Red Onions (40 Tons) • 05:22</span>
              </div>
            </div>

            {/* Auction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : error ? (
                <div className="col-span-full py-20 text-center bg-red-50 rounded-3xl border border-red-200">
                  <p className="text-red-600 font-bold uppercase tracking-widest text-xs">Error: {error}</p>
                  <button 
                    onClick={fetchAuctions}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : auctions.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <Gavel size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active auctions at the moment</p>
                  <p className="text-gray-400 text-xs mt-2">Check back soon or create a new auction!</p>
                </div>
              ) : auctions.map((item) => (
                <motion.div 
                  key={item._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.product?.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0A1628] text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      {item.product?.category || 'BULK DEALS'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                      {(() => {
                        const diff = new Date(item.endTime) - now;
                        if (diff <= 0) return 'ENDED';
                        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                        return `${h}:${m}:${s}`;
                      })()}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-black text-gray-900 mb-1">{item.product?.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                        {item.product?.location || 'Direct from Farm'} • Stock: {item.product?.stock}
                      </p>
                      
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Current Bid</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-gray-900">&#8377;{item.currentBid.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400">/unit</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!sessionStorage.getItem('token')) {
                          navigate('/login');
                          return;
                        }
                        setSelectedAuction(item);
                        setShowBidModal(true);
                        setPaymentInfo(null);
                        setError('');
                        setBidAmount('');
                        fetchUserBidInfo(item._id);
                      }}
                      className="w-full border-2 border-[#10B981] text-[#10B981] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-all"
                    >
                      Bid Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Feed */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Live Bids Feed */}
            <div className="bg-[#0A1628] rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-xl font-bold italic">Live Bids Feed</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                {auctions.length > 0 && auctions[0].bids?.filter(b => b.isActive).length > 0 ? (
                  auctions[0].bids
                    .filter(b => b.isActive)
                    .slice(-5)
                    .reverse()
                    .map((bid, i) => {
                      const userPayment = auctions[0].userPayments?.find(p => p.user._id === bid.user._id || p.user === bid.user);
                      const userName = bid.user?.name || `User ${i+1}`;
                      return (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors mb-3"
                        >
                          <div>
                            <div className="text-[11px] font-black text-white leading-none mb-1 truncate max-w-xs">{userName}</div>
                            <div className="text-[9px] font-medium text-gray-500 uppercase">{new Date(bid.time).toLocaleTimeString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-amber-500">&#8377;{bid.amount.toLocaleString()}</div>
                            {bid.amountPaid && bid.amountPaid > 0 && (
                              <div className="text-[8px] text-gray-400 font-medium">Paid: &#8377;{bid.amountPaid.toLocaleString()}</div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                ) : (
                  <div className="text-center py-4 text-gray-500 text-[10px] uppercase font-black">Waiting for bids...</div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                  Verified Auction Records Active
                </p>
              </div>
            </div>

            {/* Seller Registration Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gavel size={32} className="text-[#10B981]" />
              </div>
              <h4 className="font-serif font-black text-gray-900 mb-2">Want to list your produce?</h4>
              <p className="text-xs text-gray-500 font-medium mb-6">Join 5,000+ verified farmers selling globally.</p>
              <button 
                onClick={() => navigate('/seller-dashboard')}
                className="w-full bg-[#0A1628] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
              >
                Go to Seller Portal
              </button>
            </div>
          </aside>
        </div>

        {/* Recently Closed Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-black text-gray-900">Recently Closed Auctions</h2>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              View Archive <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commodity', 'Seller', 'Final Bid', 'Volume', 'Status'].map((header) => (
                    <th key={header} className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {closedAuctions.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-sm font-bold text-gray-900">{row.commodity}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-500">{row.seller}</td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-green-600">&#8377;{row.finalBid.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-900">{row.volume}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        row.status === 'SOLD' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Place Bid Modal */}
        <AnimatePresence>
          {showBidModal && selectedAuction && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-black text-gray-900 uppercase">Place Your Bid</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">{selectedAuction.product?.name}</p>
                    </div>
                    <button onClick={() => setShowBidModal(false)} className="text-gray-400 hover:text-gray-900 font-bold">✕</button>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-between items-center border border-gray-100">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Highest Bid</span>
                      <span className="text-2xl font-black text-gray-900">&#8377;{selectedAuction.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                  </div>

                  {userBidInfo && userBidInfo.hasBid && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                      <p className="text-[9px] text-blue-700 font-bold mb-2">Your Current Bid</p>
                      <p className="text-lg font-black text-blue-900">&#8377;{userBidInfo.currentBid.toLocaleString()}</p>
                      <p className="text-[8px] text-blue-600 mt-1">Total Paid: &#8377;{userBidInfo.totalPaid.toLocaleString()}</p>
                    </div>
                  )}

                  <form onSubmit={handleBidSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Your Bid Amount (?)</label>
                      <input 
                        type="number"
                        required
                        min={selectedAuction.currentBid + 1}
                        value={bidAmount}
                        onChange={handleBidChange}
                        placeholder={`Enter amount > ?${selectedAuction.currentBid}`}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                      />
                      <p className="text-[9px] text-gray-400 font-medium mt-2 italic px-1">
                        * Must be at least &#8377;1 higher than the current bid.
                      </p>
                    </div>

                    {paymentInfo && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-3">Payment Breakdown</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-700 font-medium">Your Bid Amount:</span>
                            <span className="font-black text-gray-900">&#8377;{paymentInfo.bidAmount.toLocaleString()}</span>
                          </div>
                          
                          {paymentInfo.isRebid && (
                            <>
                              <div className="flex justify-between items-center text-[10px] border-t border-green-200 pt-2">
                                <span className="text-gray-700 font-medium">Previous Bid:</span>
                                <span className="font-black text-gray-900">&#8377;{paymentInfo.previousBidAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-green-700 font-black">Difference to Pay:</span>
                                <span className="font-black text-green-600 text-sm">&#8377;{paymentInfo.amountToPay.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] border-t border-green-300 pt-2 mt-1">
                                <span className="text-green-900 font-black">Total (&#8377;{paymentInfo.previousBidAmount.toLocaleString()} + &#8377;{paymentInfo.amountToPay.toLocaleString()}):</span>
                                <span className="font-black text-green-900">&#8377;{paymentInfo.totalWillBePaid.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          
                          {!paymentInfo.isRebid && (
                            <div className="flex justify-between items-center text-[10px] border-t border-green-200 pt-2">
                              <span className="text-green-700 font-black">Amount to Pay:</span>
                              <span className="font-black text-green-600 text-sm">&#8377;{paymentInfo.amountToPay.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <p className="text-[10px] text-red-700 font-bold">{error}</p>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={!bidAmount || parseFloat(bidAmount) <= selectedAuction.currentBid}
                      className="w-full bg-[#10B981] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-green-500/20"
                    >
                      {paymentInfo?.isRebid ? 'Update Bid' : 'Place Bid'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">ZyLora</h2>
            <p className="text-gray-400 text-[10px] leading-relaxed max-w-xs font-medium uppercase tracking-widest">
              Redefining the agricultural marketplace through transparent negotiations and secure auctions.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Marketplace</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Live Auctions</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Auctions</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Current Lots</li>
              <li className="hover:text-amber-500 cursor-pointer">Auction Calendar</li>
              <li className="hover:text-amber-500 cursor-pointer">Selling Portal</li>
              <li className="hover:text-amber-500 cursor-pointer">Bidding Rules</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              {/* Social icons */}
            </div>
            <p className="text-[8px] text-gray-500 mt-12 uppercase tracking-widest font-black">© 2024 ZYLORA. EMPOWERING BHARAT'S AGRICULTURE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgriAuctions;

