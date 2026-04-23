import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, Menu, ShoppingCart, Heart, User, 
  ChevronRight, Star, ArrowLeft, Filter, SlidersHorizontal, LogOut
} from 'lucide-react';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // Filter products by category (case-insensitive)
  const categoryProducts = products.filter(
    p => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      {/* Header (Reused) */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Menu size={18} />
              Categories
            </button>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder={`Search in ${categoryName}...`} 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={handleLogout} className="hidden md:flex flex-col text-right group">
              <span className="text-[10px] text-gray-400 group-hover:text-amber-500">Sign Out</span>
              <span className="text-xs font-semibold group-hover:text-amber-500 flex items-center gap-1"><LogOut size={12} /> Logout</span>
            </button>
            <div className="flex items-center gap-4 text-gray-300">
              <Heart size={20} className="cursor-pointer hover:text-white" />
              <div 
                className="relative cursor-pointer hover:text-white text-amber-500"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Banner & Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">{categoryName}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 capitalize tracking-tight">{categoryName}</h1>
              <p className="text-gray-500 mt-2 text-sm max-w-md">
                Browse our curated collection of professional-grade {categoryName.toLowerCase()} with exclusive bulk pricing.
              </p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                 <Filter size={16} /> Filter
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                 <SlidersHorizontal size={16} /> Sort By
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categoryProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="group bg-white rounded-2xl border border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${prod.id}`)}
              >
                <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-8">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {prod.discount}
                    </span>
                    {prod.seller.isCertified && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        PRO
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-gray-900 hover:bg-blue-600 hover:text-white">
                    <ShoppingCart size={18} />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prod.brand}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-bold text-gray-600">{prod.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors">
                    {prod.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-gray-900">₹{prod.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{prod.oldPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">We couldn't find any products in the "{categoryName}" category.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 text-blue-600 font-bold flex items-center gap-2 mx-auto hover:underline"
            >
              <ArrowLeft size={16} /> Back to Homepage
            </button>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 ZYLORA PROFESSIONAL MARKETPLACE. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default CategoryPage;
