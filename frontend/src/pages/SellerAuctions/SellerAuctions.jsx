import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Gavel, Wallet, RotateCcw, Plus, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const SellerAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    basePrice: '',
    duration: '24',
    durationUnit: 'hours'
  });

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-3.onrender.com';

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [auctionsRes, productsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auctions/seller`, config),
        axios.get(`${BACKEND_URL}/api/products/myproducts`, config)
      ]);

      if (auctionsRes.data.success) {
        setAuctions(auctionsRes.data.data);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${BACKEND_URL}/api/auctions`, {
        productId: formData.productId,
        basePrice: Number(formData.basePrice),
        duration: Number(formData.duration),
        durationUnit: formData.durationUnit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({ productId: '', basePrice: '', duration: '24', durationUnit: 'hours' });
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to create auction:', err);
      alert(err.response?.data?.message || 'Failed to create auction');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col py-6 px-4">
          <nav className="space-y-1 flex-1">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/seller-dashboard' },
              { name: 'My Products', icon: Package, path: '/seller-dashboard' },
              { name: 'Orders', icon: ShoppingCart, path: '/seller-orders' },
              { name: 'Negotiations', icon: MessageSquare, path: '/seller-negotiations' },
              { name: 'Auction Manager', icon: Gavel, path: '/seller-auctions' },
              { name: 'Earnings', icon: Wallet, path: '/seller-earnings' },
              { name: 'Returns', icon: RotateCcw, path: '/seller-orders?filter=Returns' }
            ].map((item) => {
              const isActive = item.path === window.location.pathname + window.location.search;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Auction Manager</h1>
              <p className="text-sm text-gray-500 mt-1">Start and manage bulk order auctions.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Start New Auction
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No Active Auctions</h3>
              <p className="text-gray-500 mt-2">Start an auction to sell products in bulk to the highest bidder.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-block mt-6 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold"
              >
                Start an Auction
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <motion.div
                  key={auction._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
                      <img
                        src={auction.product?.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'}
                        alt={auction.product?.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                      auction.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {auction.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{auction.product?.name}</h3>
                  
                  <div className="flex items-center gap-2 text-xs text-amber-600 mb-4 bg-amber-50 w-fit px-2 py-1 rounded">
                    <Clock size={12} />
                    <span>Ends: {new Date(auction.endTime).toLocaleDateString()} {new Date(auction.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Price</p>
                      <p className="text-sm font-bold text-gray-900">₹{auction.basePrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><TrendingUp size={10} /> Current Bid</p>
                      <p className="text-sm font-bold text-blue-600">₹{auction.currentBid.toLocaleString()}</p>
                    </div>
                  </div>

                  {auction.highestBidder && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Highest Bidder: <span className="font-bold text-gray-900">{auction.highestBidder.name}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Start New Auction</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">âœ•</button>
            </div>
            
            <form onSubmit={handleCreateAuction} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Select Product</label>
                <select 
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="">-- Select a product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Starting Base Price (₹)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  placeholder="e.g. 5000"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Duration</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Value"
                    className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <select 
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                    className="w-32 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-gray-50 font-bold"
                  >
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                  Example: 15 minutes or 24 hours.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl flex gap-3 items-start mt-6">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Once an auction starts, it will remain active until the duration expires. The highest bidder at the end will win the auction.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Start Auction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SellerAuctions;

