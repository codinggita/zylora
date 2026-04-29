import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import { 
  ChevronRight, Star, ArrowLeft, Filter, SlidersHorizontal, Loader2, Search as SearchIcon,
  ShoppingCart
} from 'lucide-react';
import { products as staticProducts } from '../../data/products';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/products?keyword=${encodeURIComponent(query)}`);
        if (res.data.success && res.data.data.length > 0) {
          setProducts(res.data.data);
        } else {
          // Fallback to static products search
          const filtered = staticProducts.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
          );
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, BACKEND_URL]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      {/* Results Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Search Results</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {query ? `Results for "${query}"` : 'Search Products'}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {loading ? 'Searching...' : `Found ${products.length} products matching your criteria.`}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Searching for premium goods...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 mt-2">We couldn't find any products matching your search "{query}".</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 text-blue-600 font-bold flex items-center gap-2 mx-auto hover:underline"
            >
              <ArrowLeft size={16} /> Back to Homepage
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((prod) => (
              <div 
                key={prod._id} 
                className="group bg-white rounded-2xl border border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${prod._id}`)}
              >
                <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-8">
                  <img 
                    src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://placehold.co/300x300/f3f4f6/9ca3af'} 
                    alt={prod.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {prod.discount && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {prod.discount}
                      </span>
                    )}
                  </div>
                  <button 
                    className="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-gray-900 hover:bg-blue-600 hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${prod._id}`);
                    }}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prod.brand || 'Premium'}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-bold text-gray-600">{prod.rating || 0}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors">
                    {prod.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-gray-900">&#8377;{prod.price?.toLocaleString()}</span>
                    {prod.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">&#8377;{prod.oldPrice?.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default SearchPage;

