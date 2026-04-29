import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Gavel, Wallet, RotateCcw, ArrowRight, MessageCircle, Mail, Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const SellerNegotiations = () => {
  const navigate = useNavigate();
  const [acceptedNegotiations, setAcceptedNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-3.onrender.com';

  const fetchAcceptedNegotiations = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/negotiation/seller/accepted`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAcceptedNegotiations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch accepted negotiations:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedNegotiations();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <Header />

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
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Accepted Negotiations</h1>
            <p className="text-sm text-gray-500 mt-1">Only buyers whose negotiation request you accepted will appear here.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : acceptedNegotiations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No Accepted Negotiations Yet</h3>
              <p className="text-gray-500 mt-2">Once you accept a buyer's negotiation request, that buyer will appear here.</p>
              <Link to="/seller-dashboard" className="inline-block mt-6 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {acceptedNegotiations.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      Accepted
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{item.buyer.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">Accepted for: {item.product.name}</p>

                  <div className="space-y-2 mb-4 text-xs text-gray-500">
                    {item.buyer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{item.buyer.email}</span>
                      </div>
                    )}
                    {item.buyer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{item.buyer.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accepted Price</p>
                      <p className="text-lg font-bold text-gray-900">₹{(item.agreedPrice || item.product.price).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/negotiate/${item.product.id}?buyerId=${item.buyer.id}`)}
                      className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-black transition-colors"
                    >
                      <ArrowRight size={20} />
                    </button>
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

export default SellerNegotiations;
