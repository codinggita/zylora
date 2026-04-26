import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Gavel, Wallet, RotateCcw, User, Mail, Phone, MapPin, CalendarDays
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-3.onrender.com';

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/orders/seller-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch seller orders:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [BACKEND_URL, navigate]);

  const getStatusClasses = (status) => {
    if (status === 'Delivered') return 'bg-green-50 text-green-600';
    if (status === 'Shipped') return 'bg-blue-50 text-blue-600';
    if (status === 'Cancelled') return 'bg-red-50 text-red-600';
    return 'bg-amber-50 text-amber-600';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col py-6 px-4">
          <nav className="space-y-1 flex-1">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/seller-dashboard' },
              { name: 'My Products', icon: Package, path: '#' },
              { name: 'Orders', icon: ShoppingCart, active: true, path: '/seller-orders' },
              { name: 'Negotiations', icon: MessageSquare, path: '/seller-negotiations' },
              { name: 'Auction Manager', icon: Gavel, path: '#' },
              { name: 'Earnings', icon: Wallet, path: '#' },
              { name: 'Returns', icon: RotateCcw, path: '#' }
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">See which users ordered your products and track each seller-side item.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
              <p className="text-gray-500 mt-2">When users buy your listed products, their order details will appear here.</p>
              <Link to="/seller-dashboard" className="inline-block mt-6 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
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
                        <div className="mt-2 text-2xl font-bold text-gray-900">₹{order.sellerTotal.toLocaleString()}</div>
                      </div>
                    </div>
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
                              <p className="text-xs text-gray-500">Unit price: ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Total</div>
                            <div className="mt-1 text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
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
