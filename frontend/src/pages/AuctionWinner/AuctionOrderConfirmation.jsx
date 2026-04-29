import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Loader, AlertCircle, Truck, MapPin, 
  Package, ShoppingBag, ArrowRight, Share2, Printer,
  ChevronLeft, ShieldCheck
} from 'lucide-react';
import Header from '../../components/Header';

const AuctionOrderConfirmation = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [winnerStatus, setWinnerStatus] = useState(null);
  const [error, setError] = useState('');

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-3.onrender.com';

  useEffect(() => {
    fetchWinnerStatus();
  }, [auctionId]);

  const fetchWinnerStatus = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(
        `${BACKEND_URL}/api/auctions/${auctionId}/winner-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setWinnerStatus(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Generating Receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          {/* Success Banner */}
          <div className="bg-green-600 p-12 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px] rotate-12"></div>
            </div>
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30"
            >
              <CheckCircle size={40} className="text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-serif font-black mb-2">Order Confirmed!</h1>
            <p className="text-green-100 font-medium text-sm">Your auction win has been successfully processed.</p>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Side: Order Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Order Details</h3>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      <img src={winnerStatus?.product?.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-gray-900 text-sm">{winnerStatus?.product?.name}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Lot ID: {auctionId.slice(-8)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Delivery To</h3>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{winnerStatus?.address?.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                        {winnerStatus?.address?.address}, {winnerStatus?.address?.city}, {winnerStatus?.address?.state} {winnerStatus?.address?.postalCode}
                      </p>
                      <p className="text-xs text-gray-900 font-bold mt-2">ðŸ“± {winnerStatus?.address?.mobile}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Next Steps</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                      <p className="text-xs text-gray-600 font-medium">Seller acknowledges the order (within 12h)</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                      <p className="text-xs text-gray-600 font-medium">Logistics partner picks up from farm</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                      <p className="text-xs text-gray-600 font-medium">Real-time tracking link sent to your email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Summary Card */}
              <div className="bg-gray-900 rounded-[32px] p-8 text-white h-fit">
                <h3 className="text-xl font-serif font-black mb-8 italic">Settlement Receipt</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Winning Bid</span>
                    <span className="text-white">₹{winnerStatus?.winningBid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Platform Fee</span>
                    <span className="text-green-400">PAID</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>GST (Included)</span>
                    <span className="text-white">₹{(winnerStatus?.winningBid * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest">Total Settle</span>
                    <span className="text-3xl font-black text-green-400">₹{winnerStatus?.winningBid?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-400" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Escrow Protected</span>
                  </div>
                  <CheckCircle size={14} className="text-green-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all">
                    <Printer size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Print</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all">
                    <Share2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft size={16} /> Go to My Orders
              </button>
              <button 
                onClick={() => navigate('/agri-auctions')}
                className="bg-[#0A1628] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuctionOrderConfirmation;

