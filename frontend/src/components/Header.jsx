import React, { useState, useEffect } from 'react';
import { 
  Search, Menu, X, ShoppingCart, Heart, User, LogOut, LayoutDashboard, Home, Gavel, MessageSquare, Wallet, Globe, Package, RotateCcw
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../features/ui/uiSlice';
import { products as staticProducts } from '../data/products';

const Header = ({ placeholder, isDashboard = false }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const getSuggestions = () => {
    if (!searchQuery.trim()) {
      return ['iPhone 15', 'Samsung S24', 'Organic Honey', 'Denim Jacket', 'Office Chair'];
    }
    const query = searchQuery.toLowerCase().trim();
    const matches = new Set();
    staticProducts.forEach(p => {
      if (p.name.toLowerCase().includes(query)) matches.add(p.name);
      if (p.category.toLowerCase().includes(query)) matches.add(p.category);
      if (p.brand && p.brand.toLowerCase().includes(query)) matches.add(p.brand);
    });
    return Array.from(matches).slice(0, 6);
  };
  const suggestions = getSuggestions();

  useEffect(() => {
    if (searchParams?.get('q')) {
      setSearchQuery(searchParams.get('q'));
    }
  }, [searchParams]);

  const categories = [
    { name: t('electronics'), path: 'Electronics', icon: '📱' },
    { name: t('fashion'), path: 'Fashion', icon: '👕' },
    { name: t('agri'), path: 'Agri', icon: '🌾' },
    { name: t('home'), path: 'Home', icon: '🏠' },
    { name: t('furniture'), path: 'Furniture', icon: '🪑' },
    { name: t('sports'), path: 'Sports', icon: '⚽' },
    { name: t('beauty'), path: 'Beauty', icon: '💄' },
    { name: t('toys'), path: 'Toys', icon: '🧸' },
    { name: t('books'), path: 'Books', icon: '📚' },
    { name: t('grocery'), path: 'Grocery', icon: '🛒' },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    dispatch(setLanguage(newLang));
  };

  // Read role from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isSeller = user?.role === 'seller';

  const handleLogout = async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Refresh contexts to clear data and switch to guest mode
    await Promise.all([
      fetchCart(),
      fetchWishlist()
    ]);
    
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (isDashboard) {
    return (
      <header className="bg-[#0A1628] text-white sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-12">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X size={20} className="text-amber-500" /> : <Menu size={20} className="text-amber-500" />}
            </button>
            <Link to="/seller-dashboard" className="text-xl lg:text-2xl font-bold tracking-tighter">Zylora</Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/login" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Become a Seller</Link>
              <Link to="/agri-auctions" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Agri Auctions</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative group hidden sm:block">
              <input 
                type="text" 
                placeholder="Search..."
                className="bg-[#111827] border border-gray-700/50 rounded-lg py-2 px-4 pr-10 text-xs w-32 lg:w-64 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="flex items-center gap-1 lg:gap-4">
              <button onClick={toggleLanguage} className="p-2 hover:bg-white/5 rounded-lg transition-all group" title={i18n.language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}>
                <Globe size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/5 rounded-lg transition-all group" title="Profile">
                <User size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => navigate('/cart')} className="p-2 hover:bg-white/5 rounded-lg transition-all group" title="Cart">
                <ShoppingCart size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg transition-all group" title="Logout">
                <LogOut size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay for Dashboard */}
        <AnimatePresence>
          {mobileMenuOpen && isDashboard && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A1628] border-r border-gray-800 z-[70] lg:hidden flex flex-col p-6"
              >
                <div className="flex items-center justify-between mb-10">
                  <Link to="/seller-dashboard" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black tracking-tighter">
                    <span className="text-white">Zy</span>
                    <span className="text-amber-500">Lora</span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-2 flex-1">
                  {[
                    { name: t('dashboard'), icon: LayoutDashboard, path: '/seller-dashboard' },
                    { name: t('my_products'), icon: Package, path: '/seller-dashboard' },
                    { name: t('orders'), icon: ShoppingCart, path: '/seller-orders' },
                    { name: t('negotiations'), icon: MessageSquare, path: '/seller-negotiations' },
                    { name: t('auction_manager'), icon: Gavel, path: '/seller-auctions' },
                    { name: t('earnings'), icon: Wallet, path: '/seller-earnings' },
                    { name: t('returns'), icon: RotateCcw, path: '/seller-orders?filter=Returns' }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <item.icon size={20} className="text-amber-500" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="pt-6 border-t border-gray-800">
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} />
                    {t('logout')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    );
  }

  return (
    <header className="bg-[#0A1628] text-white sticky top-0 z-50 shadow-2xl">
      {/* 1. Top Notification Bar */}
      <div className="bg-[#0A1628] text-[10px] md:text-xs py-2 px-4 flex justify-center items-center gap-3 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span>🎉</span>
          <span className="text-gray-300">Free delivery on orders above ₹499</span>
        </div>
        <span className="text-amber-500 font-bold">•</span>
        <Link to="/agri-auctions" className="flex items-center gap-2 group">
          <span>🌿</span>
          <span className="text-amber-500 font-bold group-hover:text-amber-400 transition-colors">Agri Auctions Live Now →</span>
        </Link>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        {/* 2. Main Header Row */}
        <div className="flex items-center justify-between gap-6 py-4">
          {/* Left: Logo & Categories */}
          <div className="flex items-center gap-8">
            <Link 
              to={isSeller ? '/seller-dashboard' : '/'} 
              className="text-2xl font-black tracking-tighter flex items-center"
            >
              <span className="text-white">Zy</span>
              <span className="text-amber-500">Lora</span>
            </Link>

            {!isSeller && (
              <div className="relative">
                <button 
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/10"
                >
                  <Menu size={20} className="text-white group-hover:text-amber-500" />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-widest">CATEGORIES</span>
                </button>

                {/* Categories Dropdown */}
                {categoriesOpen && (
                  <div 
                    className="absolute left-0 mt-4 w-[600px] bg-[#111827] border border-gray-700/50 rounded-[32px] shadow-2xl p-8 z-[60] grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    <div className="col-span-2 mb-4 border-b border-gray-800 pb-4">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">Shop by Category</h4>
                    </div>
                    {categories.map((cat) => (
                      <Link 
                        key={cat.path}
                        to={`/category/${cat.path}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 group transition-all"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform">{cat.icon}</span>
                        <div>
                          <p className="font-bold text-gray-200 group-hover:text-amber-500 transition-colors">{cat.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Explore Collection</p>
                        </div>
                      </Link>
                    ))}
                    <div className="col-span-2 mt-4 pt-4 border-t border-gray-800 text-center">
                      <Link to="/search" className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors">View All Collections →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Large Search Bar */}
          {!isSeller && (
            <div className="hidden md:flex flex-1 max-w-3xl relative group">
              <form onSubmit={handleSearch} className="w-full relative">
                <input 
                  type="text" 
                  placeholder="Search for premium goods or agri-lots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="w-full bg-[#111827] border border-gray-700/50 rounded-xl py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-gray-500 text-gray-200 group-hover:bg-[#1a2333]"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors">
                  <Search size={20} className="pointer-events-none" />
                </button>
              </form>
              
              {/* Desktop Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-gray-700/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                  {!searchQuery.trim() && (
                    <div className="px-6 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 mb-1">
                      Trending Searches
                    </div>
                  )}
                  {suggestions.length > 0 ? suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
                        setSearchFocused(false);
                      }}
                      className="px-6 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-500 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <Search size={14} className="text-gray-500" />
                      <span className="line-clamp-1">{suggestion}</span>
                    </div>
                  )) : (
                    <div className="px-6 py-3 text-sm text-gray-500 flex items-center gap-3">
                       No recommendations found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right: Actions & Icons */}
          <div className="flex items-center gap-6">
            {!isSeller && (
              <nav className="hidden xl:flex items-center gap-6">
                <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap uppercase tracking-widest">Become a Seller</Link>
                <Link to="/agri-auctions" className="flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap uppercase tracking-widest">
                  <span>🌿</span> Agri Auctions
                </Link>
              </nav>
            )}

            <div className="flex items-center gap-3 md:gap-4">
              {/* Logout Icon (Desktop only, mobile has it in the menu) */}
              {user && (
                <button 
                  onClick={handleLogout}
                  className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-all group"
                  title="Logout"
                >
                  <LogOut size={22} className="text-red-500 group-hover:scale-110 transition-transform" />
                </button>
              )}

              {/* Auth Icon */}
              <button 
                onClick={() => navigate(user ? '/profile' : '/login')}
                className="p-2 hover:bg-white/5 rounded-full transition-all group"
                title={user ? "Profile" : "Login"}
              >
                {user ? (
                  <User size={22} className="text-amber-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="flex items-center gap-1 text-amber-500">
                    <User size={22} className="group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </button>

              {/* Wishlist */}
              {!isSeller && (
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="p-2 hover:bg-white/5 rounded-full transition-all relative group"
                >
                  <Heart size={22} className={`group-hover:scale-110 transition-transform ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-amber-500'}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0A1628]">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              {!isSeller && (
                <button 
                  onClick={() => navigate('/cart')}
                  className="p-2 hover:bg-white/5 rounded-full transition-all relative group"
                >
                  <ShoppingCart size={22} className="text-amber-500 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-500 text-[10px] text-white font-black rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-[#0A1628]">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-all"
              >
                {mobileMenuOpen ? <X size={24} className="text-amber-500" /> : <Menu size={24} className="text-amber-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search - Visible only on small screens */}
        <div className="md:hidden pb-4 relative z-50">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full bg-[#111827] border border-gray-700/50 rounded-xl py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-gray-200"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors">
              <Search size={18} className="pointer-events-none" />
            </button>
          </form>

          {/* Mobile Suggestions Dropdown */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-gray-700/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
              {!searchQuery.trim() && (
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 mb-1">
                  Trending Searches
                </div>
              )}
              {suggestions.length > 0 ? suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
                    setSearchFocused(false);
                  }}
                  className="px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-500 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <Search size={14} className="text-gray-500" />
                  <span className="line-clamp-1">{suggestion}</span>
                </div>
              )) : (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-3">
                   No recommendations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && !isDashboard && (
        <div className="lg:hidden bg-[#0A1628] border-t border-gray-800 p-6 space-y-6">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-gray-700/50 rounded-xl py-3 px-6 pr-12 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={18} />
            </button>
          </form>

          <nav className="grid gap-2">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <Home size={18} className="text-amber-500" />
              <span className="font-bold text-sm">Home</span>
            </Link>
            <Link to="/agri-auctions" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <span className="text-lg">🌿</span>
              <span className="font-bold text-teal-400 text-sm">Agri Auctions</span>
            </Link>
            <Link to="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <User size={18} className="text-amber-500" />
              <span className="font-bold text-sm">My Profile</span>
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <Heart size={18} className="text-amber-500" />
              <span className="font-bold text-sm">Wishlist</span>
            </Link>
            <Link to="/cart" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <ShoppingCart size={18} className="text-amber-500" />
              <span className="font-bold text-sm">Cart</span>
            </Link>
            <Link to="/login" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all">
              <LayoutDashboard size={18} className="text-amber-500" />
              <span className="font-bold text-sm">Become a Seller</span>
            </Link>
          </nav>
          
          <div className="pt-6 border-t border-gray-800 flex flex-col gap-4">
            {user && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl transition-all text-red-500 font-bold"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

