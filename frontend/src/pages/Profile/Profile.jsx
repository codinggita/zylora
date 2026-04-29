import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, CreditCard, Settings, 
  ChevronRight, Clock, CheckCircle, Truck, AlertCircle, 
  MessageSquare, Bell, HelpCircle, Heart, ShieldCheck, Store, RotateCcw, ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');
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
    : 'https://zylora-e-commerce.onrender.com';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('token');
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
        if (error.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, BACKEND_URL]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = sessionStorage.getItem('token');
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
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };
  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to request a return for this order?')) return;

    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.put(`${BACKEND_URL}/api/orders/${orderId}/return`, {}, config);
      
      if (res.data.success) {
        alert('Return request submitted successfully!');
        // Refresh orders
        const response = await axios.get(`${BACKEND_URL}/api/orders/myorders`, config);
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error requesting return:', error);
      alert(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="text-green-500" size={16} />;
      case 'shipped': return <Truck className="text-blue-500" size={16} />;
      case 'processing': return <Clock className="text-amber-500" size={16} />;
      case 'return requested': return <RotateCcw className="text-orange-500" size={16} />;
      case 'returned': return <Package className="text-purple-500" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'return requested': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'returned': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6"
            >
              <div className="flex flex-col items-center text-center gap-3 mb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-1">{user?.name || 'User Name'}</h2>
                  <p className="text-[11px] text-gray-400 mb-2">{user?.email}</p>
                  {/* Role Badge */}
                  {user?.role === 'seller' ? (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                      <Store size={12} />
                      Business Seller
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                      <ShieldCheck size={12} />
                      Individual Buyer
                    </span>
                  )}
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'orders', label: 'My Orders', icon: Package },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'negotiations', label: 'My Negotiations', icon: MessageSquare },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'payment', label: 'Payments', icon: CreditCard },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'help', label: 'Help', icon: HelpCircle },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'} />
                    <span className="text-xs font-semibold">{item.label}</span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-1 h-5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                ))}
              </nav>
            </motion.div>
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
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
                    <div className="flex bg-white border border-gray-100 rounded-lg p-1 shadow-sm overflow-x-auto no-scrollbar">
                      {['All', 'Processing', 'Shipped', 'Delivered', 'Returns'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`px-4 md:px-6 py-2 rounded-md text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                            orderFilter === filter 
                              ? 'bg-black text-white shadow-md' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
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
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.filter(o => {
                        if (orderFilter === 'All') return true;
                        if (orderFilter === 'Returns') return o.status.toLowerCase().startsWith('return');
                        return o.status.toLowerCase() === orderFilter.toLowerCase();
                      }).length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-gray-300" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">No {orderFilter === 'All' ? '' : orderFilter} Orders</h3>
                          <p className="text-sm text-gray-500">
                            {orderFilter === 'Processing' ? 'You don\'t have any orders being processed right now.' :
                             orderFilter === 'Shipped' ? 'None of your orders are currently in transit.' :
                             orderFilter === 'Delivered' ? 'You haven\'t received any orders yet.' :
                             'You haven\'t placed any orders yet.'}
                          </p>
                        </div>
                      ) : (
                        orders
                          .filter(o => {
                            if (orderFilter === 'All') return true;
                            if (orderFilter === 'Returns') return o.status.toLowerCase().startsWith('return');
                            return o.status.toLowerCase() === orderFilter.toLowerCase();
                          })
                          .map((order) => (
                        <motion.div 
                          key={order._id}
                          layout
                          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
                        >
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-8">
                              <div className="w-40 h-40 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              
                              <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h4>
                                    <p className="text-xs text-gray-500">
                                      Order #ZY-{order._id.substring(order._id.length - 5).toUpperCase()} • Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusClass(order.status)}`}>
                                      {getStatusIcon(order.status)}
                                      {order.status}
                                    </span>
                                    {order.isNegotiated && (
                                      <span className="bg-[#10B981] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                        Negotiated Price
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 flex items-baseline gap-3">
                                  <span className="text-xl font-bold text-gray-900">&#8377;{item.price.toLocaleString()}</span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">&#8377;{item.originalPrice.toLocaleString()}</span>
                                  )}
                                </div>

                                <div className="mt-auto pt-6 flex flex-wrap gap-3">
                                  <button 
                                    onClick={() => navigate(`/track-order/${order._id}`)}
                                    className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                  >
                                    Track Order
                                  </button>
                                    <button 
                                      disabled={order.status.toLowerCase() !== 'delivered'}
                                      onClick={() => handleReturnOrder(order._id)}
                                      className={`border px-6 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                                        order.status.toLowerCase() === 'delivered' 
                                          ? 'border-gray-200 text-gray-900 hover:bg-gray-50' 
                                          : 'border-gray-100 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      Return
                                    </button>
                                  <button className="border border-gray-200 text-gray-900 px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
                                    Review
                                  </button>
                                  <button className="bg-amber-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">
                                    Buy Again
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      ))
                    )}
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

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Account Role</label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4">
                          {user?.role === 'seller' ? (
                            <>
                              <span className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                <Store size={13} />
                                Business Seller
                              </span>
                              <p className="text-[11px] text-gray-400">You have seller privileges on ZyLora.</p>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                <ShieldCheck size={13} />
                                Individual Buyer
                              </span>
                              <p className="text-[11px] text-gray-400">You have buyer access on ZyLora.</p>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-1 px-1">Role cannot be changed. Contact support if needed.</p>
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

              {['wishlist', 'negotiations', 'notifications', 'help', 'addresses', 'payment'].includes(activeTab) && (
                <motion.div
                  key="placeholders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'wishlist' ? <Heart size={32} className="text-gray-300" /> :
                     activeTab === 'negotiations' ? <MessageSquare size={32} className="text-gray-300" /> :
                     activeTab === 'notifications' ? <Bell size={32} className="text-gray-300" /> :
                     activeTab === 'help' ? <HelpCircle size={32} className="text-gray-300" /> :
                     activeTab === 'addresses' ? <MapPin size={32} className="text-gray-300" /> : 
                     <CreditCard size={32} className="text-gray-300" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h3>
                  <p className="text-sm text-gray-500 mb-6">This section is currently under development.</p>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:gap-3 transition-all"
                  >
                    <ArrowLeft size={14} /> Back to My Orders
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Profile;
