import React, { useState } from 'react';
import { 
  Search, Menu, X, ShoppingCart, Heart, User, LogOut, LayoutDashboard, Home, Gavel, MessageSquare, Wallet, Globe
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';

const Header = ({ placeholder }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
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

  return (
    <header className="bg-[#0A1628] text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Top Bar - Logo, Search, Icons */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-3">
          {/* Left: Logo & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 hover:bg-gray-800 rounded transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link 
              to={isSeller ? '/seller-dashboard' : '/'} 
              className="text-lg sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap"
            >
              ZyLora
            </Link>
          </div>

          {/* Center: Search Bar (hidden on small screens, visible from sm) */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl relative">
            <input 
              type="text" 
              placeholder={placeholder || t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-gray-700 rounded-full py-2 px-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </form>

          {/* Right: Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-1 text-gray-300 hover:text-amber-500"
              title={i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe size={18} />
              <span className="text-[10px] font-bold uppercase">{i18n.language}</span>
            </button>
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                title="User Menu"
              >
                <User size={20} className="text-gray-300 hover:text-amber-500" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-xs text-gray-400">{t('logged_in_as')}</p>
                    <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                  </div>
                  
                  <Link 
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <User size={16} /> {t('my_profile')}
                  </Link>

                  {!isSeller && (
                    <>
                      <Link 
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Heart size={16} /> {t('wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}
                      </Link>
                      <Link 
                        to="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={16} /> {t('cart')} {cartCount > 0 && `(${cartCount})`}
                      </Link>
                      <Link 
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        📦 {t('my_orders')}
                      </Link>
                    </>
                  )}

                  {isSeller && (
                    <>
                      <Link 
                        to="/seller-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <LayoutDashboard size={16} /> {t('dashboard')}
                      </Link>
                      <Link 
                        to="/seller-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        📦 {t('my_orders')}
                      </Link>
                    </>
                  )}

                  <hr className="border-gray-700 my-2" />

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut size={16} /> {t('sign_out')}
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Icon (Buyer only) */}
            {!isSeller && (
              <button 
                onClick={() => navigate('/wishlist')}
                className="hidden sm:flex p-2 hover:bg-gray-800 rounded-full transition-colors relative"
                title="Wishlist"
              >
                <Heart size={20} className={wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-amber-500'} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white font-bold rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
                )}
              </button>
            )}

            {/* Cart Icon (Buyer only) */}
            {!isSeller && (
              <button 
                onClick={() => navigate('/cart')}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
                title="Shopping Cart"
              >
                <ShoppingCart size={20} className="text-gray-300 hover:text-amber-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-lg border border-[#0A1628]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Seller Dashboard Icon */}
            {isSeller && (
              <button 
                onClick={() => navigate('/seller-dashboard')}
                className="hidden sm:flex p-2 hover:bg-gray-800 rounded-full transition-colors"
                title="Seller Dashboard"
              >
                <LayoutDashboard size={20} className="text-gray-300 hover:text-amber-500" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar for Mobile (visible on small screens) */}
        <form onSubmit={handleSearch} className="sm:hidden flex mb-3 relative">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-gray-700 rounded-full py-2 px-10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-2 text-gray-500" size={16} />
        </form>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-8 py-3 border-t border-gray-800">
          {isSeller ? (
            <>
              <Link to="/seller-dashboard" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('dashboard')}</Link>
              <Link to="/seller-negotiations" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('negotiations')}</Link>
              <Link to="/seller-orders" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('orders')}</Link>
              <Link to="/seller-earnings" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('earnings')}</Link>
            </>
          ) : (
            <>
              <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('home')}</Link>
              <Link to="/login" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-500 transition-colors">{t('become_seller')}</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t border-gray-800 mt-3">
            {isSeller ? (
              <>
                <Link to="/seller-dashboard" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <LayoutDashboard size={18} /> {t('dashboard')}
                </Link>
                <Link to="/seller-negotiations" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <MessageSquare size={18} /> {t('negotiations')}
                </Link>
                <Link to="/seller-orders" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  📦 {t('sales_orders')}
                </Link>
                <Link to="/my-orders" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  📦 {t('my_purchases')}
                </Link>
                <Link to="/wishlist" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <Heart size={18} /> {t('wishlist')}
                </Link>
                <Link to="/seller-earnings" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <Wallet size={18} /> {t('earnings')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <Home size={18} /> {t('home')}
                </Link>
                <Link to="/wishlist" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <Heart size={18} /> {t('wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to="/cart" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  <ShoppingCart size={18} /> {t('cart')} {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link to="/my-orders" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
                  📦 {t('my_orders')}
                </Link>
                <Link to="/login" onClick={closeMobileMenu} className="block px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors">
                  {t('become_seller')}
                </Link>
              </>
            )}

            <button 
              onClick={toggleLanguage}
              className="w-full text-left px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2 text-amber-500 font-bold"
            >
              <Globe size={18} /> {i18n.language === 'en' ? 'हिन्दी में बदलें (Hindi)' : 'Switch to English'}
            </button>

            <hr className="border-gray-700 my-2" />

            <button 
              onClick={handleLogout}
              className="w-full text-left px-2 py-2 text-sm hover:bg-gray-800 rounded transition-colors flex items-center gap-2 text-red-400"
            >
              <LogOut size={18} /> {t('sign_out')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

