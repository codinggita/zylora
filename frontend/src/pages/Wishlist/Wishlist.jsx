import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, MapPin, CreditCard, Settings, 
  ChevronRight, Search, Heart, ShoppingCart,
  AlertCircle, MessageSquare, LayoutDashboard, Gavel, Home, ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Header from '../../components/Header';

const Wishlist = () => {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  const { wishlistItems, loading: wishlistLoading, removeFromWishlist, wishlistCount } = useWishlist();
  const [activeTab, setActiveTab] = useState('wishlist');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-3.onrender.com';

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

        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, config);
        const userData = userRes.data.data;
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, BACKEND_URL]);

  const handleAddToCart = (item) => {
    addToCart(item, 1);
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
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{user?.name || 'User Name'}</h2>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {user?.role === 'seller' ? 'Pro Seller' : 'Pro Buyer'}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'home', label: 'Home', icon: Home, path: '/' },
                  { id: 'auctions', label: 'Live Auctions', icon: Gavel, path: '/agri-auctions' },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
                  { id: 'orders', label: 'My Orders', icon: Package, path: '/my-orders' },
                  { id: 'negotiations', label: 'Negotiations', icon: MessageSquare, path: user?.role === 'seller' ? '/seller-negotiations' : '/profile' },
                  { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' },
                ].map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-500 mt-1">{wishlistCount} items saved to your collection</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Search size={14} /> Filter
                </button>
              </div>
            </div>

            {wishlistLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={32} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">Save items you love and they'll appear here. We'll even notify you if they go on sale!</p>
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A1628] text-white rounded-xl font-bold text-sm hover:bg-black transition-colors">
                  Start Exploring
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                  {wishlistItems.map((item) => (
                    <motion.div
                      layout
                      key={item._id || item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/150x150?text=Product'} 
                          alt={item.name} 
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                        <button 
                          onClick={() => removeFromWishlist(item._id || item.id)}
                          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                        {item.hasPriceDrop && (
                          <div className="absolute bottom-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <AlertCircle size={10} /> PRICE DROP
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{item.category}</p>
                          <h3 
                            className="font-bold text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/product/${item._id || item.id}`)}
                          >
                            {item.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">₹{item.price?.toLocaleString()}</span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">₹{item.originalPrice?.toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-green-600 font-bold mt-0.5">Free Delivery</p>
                          </div>
                          <button 
                            onClick={() => handleAddToCart(item)}
                            className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 py-20 border-t border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-bold tracking-tight mb-6">ZyLora</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
              Premium agricultural and retail marketplace for professionals.
            </p>
          </div>
          
          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Platform</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">About Zylora</li>
              <li className="hover:text-white cursor-pointer transition-colors">Agri Auctions</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bulk Discounts</li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Support</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-white cursor-pointer transition-colors">Shipping Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Returns</li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Legal</h3>
            <p className="text-gray-500 text-[10px] font-medium">© 2024 Zylora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Wishlist;
