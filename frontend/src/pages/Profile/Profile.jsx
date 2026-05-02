import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, CreditCard, Settings, 
  ChevronRight, Clock, CheckCircle, Truck, AlertCircle, 
  MessageSquare, Bell, HelpCircle, Heart, ShieldCheck, Store, RotateCcw, ArrowLeft,
  Plus, Edit2, Trash2, Shield, Search, Gavel
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', mobile: '', address: '', pincode: '', type: 'Home'
  });

  const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://127.0.0.1:5001' 
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
        setAddresses(userData.addresses || []);
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

        // Fetch negotiations
        const negotiationsRes = await axios.get(`${BACKEND_URL}/api/negotiation/buyer/my-negotiations`, config);
        if (negotiationsRes.data.success) {
          setNegotiations(negotiationsRes.data.data);
        }

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

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let res;
      if (editingAddressId) {
        res = await axios.put(`${BACKEND_URL}/api/auth/addresses/${editingAddressId}`, addressForm, config);
      } else {
        res = await axios.post(`${BACKEND_URL}/api/auth/addresses`, addressForm, config);
      }
      
      if (res.data.success) {
        setAddresses(res.data.data);
        setIsAddingAddress(false);
        setEditingAddressId(null);
        setAddressForm({ name: '', mobile: '', address: '', pincode: '', type: 'Home' });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${BACKEND_URL}/api/auth/addresses/${id}`, config);
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (error) {
      alert('Failed to delete address');
    }
  };

  const handleSelectAddress = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${BACKEND_URL}/api/auth/addresses/${id}/select`, {}, config);
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (error) {
      alert('Failed to select address');
    }
  };

  const editAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      name: addr.name, mobile: addr.mobile, address: addr.address, pincode: addr.pincode, type: addr.type
    });
    setIsAddingAddress(true);
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
                                  <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900">&#8377;{(item.price * (item.quantity || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    {item.quantity > 1 && (
                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">&#8377;{Math.round(item.price).toLocaleString('en-IN')} each</span>
                                    )}
                                  </div>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">&#8377;{(item.originalPrice * (item.quantity || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  )}
                                  {item.quantity > 0 && (
                                    <span className="text-sm text-gray-600 font-bold bg-gray-100 px-3 py-1 rounded-md ml-4">
                                      Qty: {item.quantity}
                                    </span>
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
                                  <button 
                                    onClick={() => navigate(`/product/${item.product}`)}
                                    className="bg-amber-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
                                  >
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

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900">Saved Addresses</h2>
                    {!isAddingAddress && (
                      <button 
                        onClick={() => {
                          setIsAddingAddress(true);
                          setEditingAddressId(null);
                          setAddressForm({ name: '', mobile: '', address: '', pincode: '', type: 'Home' });
                        }}
                        className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                      >
                        <Plus size={16} /> Add New Address
                      </button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <h3 className="text-lg font-bold mb-6">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                      <form onSubmit={handleAddressSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Name</label>
                            <input required type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile</label>
                            <input required type="text" value={addressForm.mobile} onChange={e => setAddressForm({...addressForm, mobile: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                            <input required type="text" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Address Type</label>
                            <select value={addressForm.type} onChange={e => setAddressForm({...addressForm, type: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Address</label>
                          <textarea required value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]" />
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">Save Address</button>
                          <button type="button" onClick={() => setIsAddingAddress(false)} className="bg-gray-100 text-gray-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Found</h3>
                      <p className="text-sm text-gray-500 mb-6">You haven't saved any delivery addresses yet.</p>
                      <button onClick={() => setIsAddingAddress(true)} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">Add Address</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div key={addr._id} className={`bg-white rounded-2xl border-2 p-6 transition-all relative ${addr.selected ? 'border-amber-500 shadow-md' : 'border-gray-100 hover:border-gray-300 shadow-sm'}`}>
                          {addr.selected && (
                            <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                              <CheckCircle size={16} />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{addr.type}</span>
                              <h4 className="text-lg font-bold text-gray-900 mt-2">{addr.name}</h4>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editAddress(addr)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2 leading-relaxed">{addr.address}</p>
                          <p className="text-sm font-bold text-gray-900 mb-6">{addr.pincode} • {addr.mobile}</p>
                          {!addr.selected && (
                            <button onClick={() => handleSelectAddress(addr._id)} className="w-full py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-black hover:text-black transition-all">Set as Default</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif font-black text-gray-900">My Wishlist</h2>
                    <Link to="/" className="text-sm font-bold text-amber-600 hover:text-amber-700">Continue Shopping &rarr;</Link>
                  </div>
                  
                  {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Wishlist is Empty</h3>
                      <p className="text-sm text-gray-500 mb-6">Save items you love here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((item) => (
                        <div key={item._id || item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                          <div className="relative aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
                            <img src={item.image || item.images?.[0]} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            <button onClick={() => removeFromWishlist(item._id || item.id)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300">
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-2">{item.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-900">&#8377;{item.price?.toLocaleString()}</span>
                              <button onClick={() => addToCart(item, 1)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-800">Add to Cart</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif font-black text-gray-900">Payment Methods</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm max-w-2xl">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Shield className="text-teal-500" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Checkout Enabled</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                          ZyLora partners with Razorpay to provide military-grade secure payments. To protect your financial data, we do not store your credit card or UPI details on our servers. You will be prompted to enter payment details securely at checkout.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                            <CreditCard size={14} /> Credit/Debit Cards
                          </div>
                          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                            UPI & Netbanking
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900">Notifications</h2>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all as read</button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {[
                      { title: "Welcome to ZyLora!", desc: "Thanks for joining our premium marketplace.", time: "Just now", icon: Package, color: "text-amber-500", bg: "bg-amber-50" },
                      { title: "Security Alert", desc: "A new login was detected from your device.", time: "2 hours ago", icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
                      { title: "Agri Auctions Live", desc: "New premium lots have been added to the auction.", time: "1 day ago", icon: Gavel, color: "text-teal-500", bg: "bg-teal-50" }
                    ].map((notif, i) => (
                      <div key={i} className="flex gap-4 p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 ${notif.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <notif.icon className={notif.color} size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-sm">{notif.title}</h4>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{notif.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{notif.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'negotiations' && (
                <motion.div
                  key="negotiations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-black text-gray-900">My Negotiations</h2>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {negotiations.length} Active
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                      <p className="text-xs font-bold uppercase tracking-widest">Fetching negotiations...</p>
                    </div>
                  ) : negotiations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Negotiations</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">You haven't started any price negotiations with sellers yet. Look for the "Negotiate" button on eligible products!</p>
                      <Link to="/" className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all inline-block">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {negotiations.map((neg) => (
                        <div key={neg._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 p-2 flex items-center justify-center">
                              <img src={neg.product.image} alt={neg.product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1 line-clamp-1">{neg.product.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller:</span>
                                    <span className="text-[11px] font-bold text-blue-600">{neg.seller.storeName}</span>
                                  </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                  neg.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-100' :
                                  neg.status === 'DECLINED' ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {neg.status}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto pt-4 border-t border-gray-50">
                                <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">List Price</p>
                                  <p className="text-xs font-bold text-gray-500 line-through">&#8377;{neg.product.price.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Offer</p>
                                  <p className="text-xs font-bold text-gray-900">&#8377;{neg.lastOfferPrice?.toLocaleString()}</p>
                                </div>
                                {neg.status === 'ACCEPTED' && (
                                  <div>
                                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Final Deal</p>
                                    <p className="text-xs font-black text-green-700">&#8377;{neg.agreedPrice?.toLocaleString()}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
                                  <p className="text-xs font-bold text-gray-900">{new Date(neg.updatedAt).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="flex gap-3 mt-6">
                                <button 
                                  onClick={() => navigate(`/negotiate/${neg.product.id}?buyerId=${user._id}`)}
                                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                  <MessageSquare size={14} /> Open Chat
                                </button>
                                {neg.status === 'ACCEPTED' && (
                                  <button 
                                    onClick={() => navigate(`/cart`)}
                                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    <ShoppingCart size={14} /> Buy Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'help' && (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif font-black text-gray-900">Help & Support</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                        <MessageSquare className="text-blue-500" size={24} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">Chat with Support</h3>
                      <p className="text-sm text-gray-500 mb-6">Our team is available 24/7 to help you with orders, returns, and any other questions.</p>
                      <button className="w-full border-2 border-gray-200 text-gray-900 font-bold py-3 rounded-xl hover:border-black hover:text-black transition-colors text-sm">
                        Start Conversation
                      </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                        <AlertCircle className="text-amber-500" size={24} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">FAQs</h3>
                      <ul className="space-y-3 text-sm text-gray-600 mb-6">
                        <li className="hover:text-amber-600 cursor-pointer transition-colors flex justify-between items-center group">
                          <span>How do I track my order?</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                        </li>
                        <li className="hover:text-amber-600 cursor-pointer transition-colors flex justify-between items-center group">
                          <span>What is the return policy?</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                        </li>
                        <li className="hover:text-amber-600 cursor-pointer transition-colors flex justify-between items-center group">
                          <span>How do auctions work?</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                        </li>
                      </ul>
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View all FAQs &rarr;</button>
                    </div>
                  </div>
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
