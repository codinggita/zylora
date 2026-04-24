import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, CreditCard, Settings, 
  LogOut, ChevronRight, Search, Heart, ShoppingCart,
  Clock, CheckCircle, Truck, AlertCircle, Menu, ArrowLeft, LayoutDashboard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const Profile = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-3.onrender.com';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch actual user data from backend
        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, config);
        const userData = userRes.data.data;
        setUser(userData);
        setEditForm({
          name: userData.name || '',
          phone: userData.phone || '',
          storeName: userData.storeName || '',
          gstNumber: userData.gstNumber || '',
          businessAddress: userData.businessAddress || ''
        });

        // Fetch orders
        const response = await axios.get(`${BACKEND_URL}/api/orders/myorders`, config);
        setOrders(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, BACKEND_URL]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      };

      const res = await axios.put(`${BACKEND_URL}/api/auth/updatedetails`, editForm, config);
      
      if (res.data.success) {
        setUser(res.data.data);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="text-green-500" size={16} />;
      case 'shipped': return <Truck className="text-blue-500" size={16} />;
      case 'processing': return <Clock className="text-amber-500" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
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
          <div className="flex-1 max-w-2xl relative mx-4">
            <input 
              type="text" 
              placeholder="Search orders, products..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <Heart size={20} className="cursor-pointer hover:text-white hidden md:block" />
            <div className="relative cursor-pointer hover:text-white text-amber-500" onClick={() => navigate('/cart')}>
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-amber-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#0A1628] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{user?.name || 'User Name'}</h2>
                <p className="text-xs text-gray-500 font-medium mb-6">{user?.email || 'user@example.com'}</p>
                <div className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100">
                  {user?.role === 'seller' ? 'Business Seller' : 'Priority Member'}
                </div>
                {user?.role === 'seller' && (
                  <Link 
                    to="/seller-dashboard" 
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                  >
                    <LayoutDashboard size={14} /> Go to Dashboard
                  </Link>
                )}
              </div>

              <nav className="mt-8 space-y-1">
                {[
                  { id: 'orders', label: 'My Orders', icon: Package },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                  { id: 'settings', label: 'Account Settings', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                      activeTab === item.id 
                        ? 'bg-[#0A1628] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                  </button>
                ))}
              </nav>
            </motion.div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={16} /> LOGOUT SESSION
            </button>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900">Order History</h2>
                    <div className="flex gap-2">
                      <select className="bg-white border border-gray-100 rounded-lg px-4 py-2 text-xs font-bold text-gray-500 focus:outline-none shadow-sm">
                        <option>Last 3 Months</option>
                        <option>2023 Orders</option>
                        <option>Older</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0A1628] rounded-full animate-spin mb-4"></div>
                      <p className="text-xs font-bold uppercase tracking-widest">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-sm text-gray-500 mb-6">Looks like you haven't placed any orders recently.</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="bg-[#0A1628] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div 
                          key={order._id}
                          layout
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50">
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusClass(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Order ID</span>
                              <span className="text-xs font-bold text-gray-900 font-mono">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                            </div>
                          </div>
                          
                          <div className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1 space-y-4">
                                {order.orderItems.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100 flex-shrink-0">
                                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                                      <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity} • Price: ₹{item.price.toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="md:w-48 space-y-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Amount</span>
                                  <span className="text-lg font-black text-gray-900">₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                                <button 
                                  onClick={() => navigate('/order-success', { state: { order } })}
                                  className="w-full border border-gray-200 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900">Account Settings</h2>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                          <input 
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile Number</label>
                          <input 
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      {user?.role === 'seller' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-6 pt-2"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Store Name</label>
                            <input 
                              type="text"
                              value={editForm.storeName}
                              onChange={(e) => setEditForm({...editForm, storeName: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              placeholder="Your business name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">GST Number</label>
                            <input 
                              type="text"
                              value={editForm.gstNumber}
                              onChange={(e) => setEditForm({...editForm, gstNumber: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              placeholder="22AAAAA0000A1Z5"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Business Address</label>
                            <textarea 
                              value={editForm.businessAddress}
                              onChange={(e) => setEditForm({...editForm, businessAddress: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                              placeholder="Complete office/shop address"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                        <input 
                          type="email"
                          value={user?.email}
                          disabled
                          className="w-full bg-gray-100 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-gray-400 italic mt-1 px-1">Email cannot be changed for security reasons.</p>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit"
                          disabled={updating}
                          className={`bg-[#0A1628] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {updating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              SAVING CHANGES...
                            </>
                          ) : (
                            'SAVE PROFILE SETTINGS'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {['addresses', 'payment'].includes(activeTab) && (
                <motion.div
                  key="other"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'addresses' ? <MapPin size={32} className="text-gray-300" /> : <CreditCard size={32} className="text-gray-300" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                  <p className="text-sm text-gray-500 mb-6">This section is currently under development.</p>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-[#0A1628] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:gap-3 transition-all"
                  >
                    <ArrowLeft size={14} /> Back to My Orders
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">ZyLora</h2>
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.2em] mb-8">Premium Agricultural & Electronic Marketplace</p>
          <div className="flex justify-center gap-8 text-[8px] text-gray-500 font-black uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
          <p className="text-[8px] text-gray-600 mt-12 uppercase tracking-widest">© 2024 ZYLORA. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
