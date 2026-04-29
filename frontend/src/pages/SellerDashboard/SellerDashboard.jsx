import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Gavel, Wallet, RotateCcw, Settings, Plus,
  ArrowUpRight, TrendingUp, CheckCircle2,
  X, Edit, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import EarningsAnalytics from '../../components/EarningsAnalytics';

const SellerDashboard = ({ initialTab = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [negotiationSummary, setNegotiationSummary] = useState({
    openNegotiations: 0,
    newRequests: 0,
    conversations: []
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    image: '',
    negotiable: true
  });

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-e-commerce.onrender.com';

  const getAuthConfig = () => {
    const token = sessionStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchDashboardData = async () => {
    try {
      const config = getAuthConfig();
      const [productsRes, ordersRes, negotiationsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/products/myproducts`, config),
        axios.get(`${BACKEND_URL}/api/orders/seller-orders`, config),
        axios.get(`${BACKEND_URL}/api/negotiation/seller/summary`, config)
      ]);

      if (productsRes.data.success) {
        setSellerProducts(productsRes.data.data);
      }

      if (ordersRes.data.success) {
        setSellerOrders(ordersRes.data.data);
      }

      if (negotiationsRes.data.success) {
        setNegotiationSummary(negotiationsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        images: newProduct.image ? [newProduct.image] : ['https://placehold.co/300x300/f3f4f6/9ca3af']
      };

      const res = await axios.post(`${BACKEND_URL}/api/products`, productData, getAuthConfig());

      if (res.data.success) {
        alert('Product added successfully!');
        setShowAddModal(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: 'Electronics',
          stock: '',
          image: '',
          negotiable: true
        });
        fetchDashboardData();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(err.response?.data?.error || 'Failed to add product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...editingProduct,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        images: editingProduct.image ? [editingProduct.image] : editingProduct.images
      };

      const res = await axios.put(
        `${BACKEND_URL}/api/products/${editingProduct._id}`,
        productData,
        getAuthConfig()
      );

      if (res.data.success) {
        alert('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        fetchDashboardData();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(err.response?.data?.error || 'Failed to update product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/products/${productId}`, getAuthConfig());

      if (res.data.success) {
        alert('Product deleted successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(err.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct({
      ...product,
      image: product.images?.[0] || ''
    });
    setShowEditModal(true);
  };

  const totalRevenue = sellerOrders.reduce((sum, order) => sum + (order.sellerTotal || 0), 0);
  const pendingOrders = sellerOrders.filter((order) => order.status === 'Processing').length;
  const recentOrders = sellerOrders.slice(0, 4);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getMonthlyRevenue = (month, year) => sellerOrders.reduce((sum, order) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate.getMonth() === month && orderDate.getFullYear() === year) {
      return sum + (order.sellerTotal || 0);
    }
    return sum;
  }, 0);

  const currentMonthRevenue = getMonthlyRevenue(currentMonth, currentYear);
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthRevenue = getMonthlyRevenue(prevMonth, prevYear);

  const revenueChangeText = previousMonthRevenue > 0
    ? `${(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)}% vs last month`
    : (currentMonthRevenue > 0 ? 'New revenue this month' : 'No revenue yet');

  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentYear, currentMonth - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      total: getMonthlyRevenue(date.getMonth(), date.getFullYear()),
      orderCount: sellerOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      }).length
    };
  });

  const maxRevenue = Math.max(...revenueByMonth.map((month) => month.total), 0);
  const hasRevenueData = maxRevenue > 0;

  const stats = [
    {
      label: 'TOTAL REVENUE',
      value: `\u20B9${totalRevenue.toLocaleString()}`,
      change: revenueChangeText,
      icon: Wallet,
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    },
    {
      label: 'ACTIVE LISTINGS',
      value: sellerProducts.length.toString(),
      change: sellerProducts.length > 0 ? 'Live seller products' : 'Add your first product',
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      label: 'PENDING ORDERS',
      value: pendingOrders.toString(),
      change: pendingOrders > 0 ? 'Orders need fulfillment' : 'No pending orders',
      icon: ShoppingCart,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      label: 'OPEN NEGOTIATIONS',
      value: negotiationSummary.openNegotiations.toString(),
      change: negotiationSummary.newRequests > 0 ? `${negotiationSummary.newRequests} new requests` : 'No new requests',
      icon: MessageSquare,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    }
  ];

  const statusColor = (status) => {
    if (status === 'Processing') return 'text-amber-500';
    if (status === 'Shipped') return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col py-6 px-4">
          <div className="mb-10 px-4">
            <h3 className="text-sm font-bold text-gray-900">ZyLora Hub</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Professional Marketplace</p>
          </div>

          <nav className="space-y-1 flex-1">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/seller-dashboard' },
              { name: 'My Products', icon: Package, tab: 'My Products', path: '/seller-dashboard' },
              { name: 'Orders', icon: ShoppingCart, path: '/seller-orders' },
              { name: 'Negotiations', icon: MessageSquare, path: '/seller-negotiations' },
              { name: 'Auction Manager', icon: Gavel, path: '/seller-auctions' },
              { name: 'Earnings', icon: Wallet, path: '/seller-earnings' },
              { name: 'Returns', icon: RotateCcw, path: '/seller-orders?filter=Returns' }
            ].map((item) => {
              const isActive = item.tab 
                ? activeTab === item.tab 
                : (item.path === window.location.pathname + window.location.search) && activeTab === (item.name === 'Dashboard' ? 'Dashboard' : activeTab);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => item.tab && setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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

          <div className="pt-6 border-t border-gray-100">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Settings size={18} />
              Settings
            </a>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'Earnings' ? 'Earnings & AI Analytics' : 'Seller Overview'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'Earnings' 
                  ? 'Track your revenue performance and get AI-powered insights.'
                  : 'Track your marketplace performance and manage deals.'}
              </p>
            </div>
            {activeTab === 'Dashboard' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-900 transition-colors"
              >
                <Plus size={18} />
                Add New Product
              </button>
            )}
          </div>

          <AnimatePresence>
            {showAddModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">List New Product</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g. UltraBook Pro X 2024"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          required
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows="3"
                          placeholder="Describe your product features and condition..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (&#8377;)</label>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                          <option>Electronics</option>
                          <option>Agriculture</option>
                          <option>Industrial</option>
                          <option>Automotive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          required
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          placeholder="0"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                        <input
                          type="url"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer" onClick={() => setNewProduct({ ...newProduct, negotiable: !newProduct.negotiable })}>
                          <motion.div
                            animate={{ x: newProduct.negotiable ? 20 : 2 }}
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">Enable Negotiation</span>
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium max-w-[200px]">Allows buyers to send bulk deal offers for this product.</p>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Publishing...' : 'Publish Product'}
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEditModal && editingProduct && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleEditProduct} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="e.g. UltraBook Pro X 2024"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          required
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          rows="3"
                          placeholder="Describe your product features and condition..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (&#8377;)</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                          <option>Electronics</option>
                          <option>Agriculture</option>
                          <option>Industrial</option>
                          <option>Automotive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                          placeholder="0"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                        <input
                          type="url"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer" onClick={() => setEditingProduct({ ...editingProduct, negotiable: !editingProduct.negotiable })}>
                          <motion.div
                            animate={{ x: editingProduct.negotiable ? 20 : 2 }}
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">Enable Negotiation</span>
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium max-w-[200px]">Allows buyers to send bulk deal offers for this product.</p>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Updating...' : 'Update Product'}
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {activeTab === 'Earnings' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.slice(0, 2).map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      {i === 0 && <TrendingUp className="text-green-500" size={16} />}
                    </div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                    <p className={`text-xs mt-2 ${i === 0 ? 'text-green-600' : 'text-gray-500'}`}>{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Earnings Analytics Section */}
              <EarningsAnalytics 
                sellerOrders={sellerOrders}
                sellerProducts={sellerProducts}
                totalRevenue={totalRevenue}
                pendingOrders={pendingOrders}
                negotiationCount={negotiationSummary.openNegotiations}
              />

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-gray-900">Revenue Performance</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                    Last 6 Months
                  </div>
                </div>
                {hasRevenueData ? (
                  <div className="flex-1 flex items-end justify-between px-4 pb-2">
                    {revenueByMonth.map((month) => (
                      <div key={month.key} className="flex flex-col items-center gap-4 w-full">
                        <div className="w-12 bg-blue-50 rounded-t-lg relative group h-[220px] flex items-end">
                          <div
                            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                            style={{ height: `${Math.max((month.total / maxRevenue) * 100, 6)}%` }}
                          ></div>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            &#8377;{month.total.toLocaleString()} • {month.orderCount} orders
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-gray-400">{month.label}</span>
                          <div className="text-[10px] font-bold text-gray-900 mt-1">&#8377;{month.total.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm">
                      <div className="text-sm font-bold text-gray-900">No revenue data yet</div>
                      <p className="text-xs text-gray-500 mt-2">
                        This chart will start plotting your monthly revenue as soon as orders are placed for your products.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'My Products' ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Listed Products</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Negotiate</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sellerProducts.length > 0 ? sellerProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-sm font-bold text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">&#8377;{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${product.negotiable ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                            {product.negotiable ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">ACTIVE</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-sm">
                          No products found. Start by adding your first product!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      {i === 0 && <TrendingUp className="text-green-500" size={16} />}
                    </div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                    <p className={`text-xs mt-2 ${i === 0 ? 'text-green-600' : 'text-gray-500'}`}>{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Recent Products</h3>
                      <button 
                        onClick={() => setActiveTab('My Products')}
                        className="text-blue-600 text-sm font-bold hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sellerProducts.slice(0, 5).length > 0 ? sellerProducts.slice(0, 5).map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={product.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                  <span className="text-sm font-bold text-gray-900">{product.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">&#8377;{product.price.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">{product.stock}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm">
                                No products found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 space-y-8">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900">Negotiations</h3>
                      <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded-md uppercase">
                        {negotiationSummary.newRequests} New
                      </span>
                    </div>
                    <div className="space-y-4">
                      {negotiationSummary.conversations.length > 0 ? negotiationSummary.conversations.map((neg, i) => (
                        <div key={neg.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? 'bg-gray-900' : 'bg-blue-600'}`}>
                              {neg.buyerInitial}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{neg.buyerName}</div>
                              <div className="text-[10px] font-medium text-gray-500">
                                {neg.offerPrice
                                  ? <>Offered: <span className="text-gray-900 font-bold">&#8377;{neg.offerPrice.toLocaleString()}</span></>
                                  : <>Interested in <span className="text-gray-900 font-bold">{neg.product?.name}</span></>
                                }
                              </div>
                            </div>
                          </div>
                          {neg.lastMessage && (
                            <p className="text-xs text-gray-500 italic mb-4 leading-relaxed">"{neg.lastMessage}"</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/negotiate/${neg.product.id}?buyerId=${neg.id.split(':')[1]}`)}
                              className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                            >
                              Open Chat
                            </button>
                            <button
                              onClick={() => navigate('/seller-negotiations')}
                              className="flex-1 bg-white border border-gray-200 text-gray-900 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                            >
                              View All
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                          No live negotiations yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Recent Orders</h3>
                    <div className="space-y-4">
                      {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gray-50 rounded-lg text-blue-600 group-hover:bg-blue-50 transition-colors">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</div>
                              <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                {order.sellerItemCount} items â€¢ {order.paymentMethod}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">&#8377;{order.sellerTotal.toLocaleString()}</div>
                            <div className={`text-[10px] font-black mt-1 ${statusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                          No live orders yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[#0A1628] text-white pt-16 pb-8 px-6 mt-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ZyLora</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing the professional and agricultural marketplace with integrity and precision.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">About ZyLora</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bulk Discounts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Agri Auctions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seller Protection</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6">Get the latest marketplace insights and deals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-[#111827] border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto pt-8 border-t border-gray-800 text-center text-[10px] font-medium text-gray-600">
          Â© 2024 ZyLora. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SellerDashboard;

