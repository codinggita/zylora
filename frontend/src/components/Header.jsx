import React, { useState } from 'react';
import { 
  Search, Menu, ShoppingCart, Heart, User, LogOut, LayoutDashboard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Header = ({ placeholder = "Search for premium goods..." }) => {
  const navigate = useNavigate();
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');

  // Read role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isSeller = user?.role === 'seller';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Refresh contexts to clear data and switch to guest mode
    await Promise.all([
      fetchCart(),
      fetchWishlist()
    ]);
    
    navigate('/login');
  };

  return (
    <header className="bg-[#0A1628] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo & Categories */}
        <div className="flex items-center gap-6">
          {/* Role-aware logo link */}
          <Link 
            to={isSeller ? '/seller-dashboard' : '/'} 
            className="text-xl md:text-2xl font-bold tracking-tight text-white"
          >
            ZyLora
          </Link>
          {!isSeller && (
            <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Menu size={18} />
              Categories
            </button>
          )}
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
            {isSeller ? (
              // Seller nav links
              <>
                <Link to="/seller-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <Link to="/seller-negotiations" className="hover:text-white transition-colors">Negotiations</Link>
                <Link to="/agri-auctions" className="hover:text-white transition-colors">Agri Auctions</Link>
              </>
            ) : (
              // Buyer nav links
              <>
                <Link to="/seller-dashboard" className="hover:text-white transition-colors">Become a Seller</Link>
                <Link to="/agri-auctions" className="hover:text-white transition-colors">Agri Auctions</Link>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <input 
            type="text" 
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2 text-gray-500" size={18} />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={handleLogout}
            className="hidden md:flex flex-col text-right group"
          >
            <span className="text-[10px] text-gray-400 group-hover:text-amber-500 transition-colors">Sign Out</span>
            <span className="text-xs font-semibold flex items-center gap-1 group-hover:text-amber-500 transition-colors">
              <LogOut size={12} /> Logout
            </span>
          </button>

          <div className="flex items-center gap-4">
            {isSeller ? (
              // Seller: show Dashboard icon + Profile
              <>
                <div 
                  className="relative cursor-pointer hover:text-amber-500 transition-colors"
                  onClick={() => navigate('/seller-dashboard')}
                  title="Seller Dashboard"
                >
                  <LayoutDashboard size={20} />
                </div>
                <User 
                  size={20} 
                  className="cursor-pointer hover:text-amber-500 transition-colors" 
                  onClick={() => navigate('/profile')}
                />
              </>
            ) : (
              // Buyer: show Wishlist, Profile, Cart
              <>
                <div className="relative cursor-pointer hover:text-amber-500 transition-colors" onClick={() => navigate('/wishlist')}>
                  <Heart size={20} className={wishlistCount > 0 ? 'text-red-500 fill-red-500' : ''} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold px-1 rounded-full min-w-[18px] text-center">{wishlistCount}</span>
                  )}
                </div>
                <User 
                  size={20} 
                  className="cursor-pointer hover:text-amber-500 transition-colors" 
                  onClick={() => navigate('/profile')}
                />
                <div 
                  className="relative cursor-pointer hover:text-amber-500 transition-colors"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full min-w-[18px] text-center">{cartCount}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

