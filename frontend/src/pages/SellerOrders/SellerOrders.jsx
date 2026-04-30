import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Gavel, Wallet, RotateCcw, User, Mail, Phone, MapPin, CalendarDays
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-e-commerce.onrender.com';

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam) {
      setFilter(filterParam);
    }

    const fetchSellerOrders = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/orders/seller-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch seller orders:', err);
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [BACKEND_URL, navigate]);

  const handleReturnAction = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'Returned' ? 'approve' : 'reject'} this return?`)) return;

    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.put(`${BACKEND_URL}/api/orders/${orderId}/return-status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message);
        // Refresh orders
        const response = await axios.get(`${BACKEND_URL}/api/orders/seller-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Failed to update return status:', err);
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const getStatusClasses = (status) => {
    if (status === 'Delivered') return 'bg-green-50 text-green-600';
    if (status === 'Shipped') return 'bg-blue-50 text-blue-600';
    if (status === 'Cancelled') return 'bg-red-50 text-red-600';
    if (status === 'Return Requested') return 'bg-orange-100 text-orange-700';
    if (status === 'Returned') return 'bg-purple-100 text-purple-700';
    if (status === 'Return Rejected') return 'bg-gray-200 text-gray-700';
    return 'bg-amber-50 text-amber-600';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <Header isDashboard={true} />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
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

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500 mt-1">See which users ordered your products and track each seller-side item.</p>
            </div>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto no-scrollbar">
              {['All', 'Processing', 'Shipped', 'Delivered', 'Returns'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                    filter === f
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.filter(o => {
            if (filter === 'All') return true;
            if (filter === 'Returns') return o.status.toLowerCase().startsWith('return');
            return o.status.toLowerCase() === filter.toLowerCase();
          }).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No {filter === 'All' ? '' : filter} Orders</h3>
              <p className="text-gray-500 mt-2">You don't have any orders matching the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders
                .filter(o => {
                  if (filter === 'All') return true;
                  if (filter === 'Returns') return o.status.toLowerCase().startsWith('return');
                  return o.status.toLowerCase() === filter.toLowerCase();
                })
                .map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base font-bold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h2>
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${getStatusClasses(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">{order.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span>{order.customer.email || 'Email not available'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{order.customer.phone || order.shippingAddress?.mobile || 'Phone not available'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-400" />
                          <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-start gap-2 md:col-span-2">
                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                          <span>{order.shippingAddress?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 xl:min-w-[260px]">
                      <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Sold</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{order.sellerItemCount}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller Revenue</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">&#8377;{order.sellerTotal.toLocaleString()}</div>
                      </div>
                    </div>

                    {order.status === 'Return Requested' && (
                      <div className="flex flex-col gap-2 mt-4 xl:mt-0 xl:min-w-[140px]">
                        <button 
                          onClick={() => handleReturnAction(order._id, 'Returned')}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                        >
                          Approve Return
                        </button>
                        <button 
                          onClick={() => handleReturnAction(order._id, 'Return Rejected')}
                          className="w-full border border-red-600 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          Reject Return
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Products Ordered From You</div>
                    <div className="space-y-4">
                      {order.sellerItems.map((item) => (
                        <div key={`${order._id}-${item.product}`} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-2">
                              <img
                                src={item.productDetails?.image || item.image}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{item.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                              <p className="text-xs text-gray-500">Unit price: &#8377;{item.price.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Total</div>
                            <div className="mt-1 text-lg font-bold text-gray-900">&#8377;{(item.price * item.quantity).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerOrders;
