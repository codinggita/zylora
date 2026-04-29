import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Star, Clock, ShieldCheck, 
  Truck, RotateCcw, MessageSquare, Info,
  Plus, Minus, Share2, Store, ArrowLeft,
  ShoppingCart, Heart, TrendingUp
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { products as staticProducts } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isSeller = user?.role === 'seller';
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeAuction, setActiveAuction] = useState(null);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  const getBulkDeals = (basePrice, existingDeals) => {
    if (existingDeals && existingDeals.length > 0) return existingDeals;
    return [
      { range: '10-50 units', price: `\u20B9${Math.floor(basePrice * 0.9).toLocaleString()}`, savings: '10% OFF', highlight: false },
      { range: '50-100 units', price: `\u20B9${Math.floor(basePrice * 0.85).toLocaleString()}`, savings: '15% OFF', highlight: true },
      { range: '100+ units', price: `\u20B9${Math.floor(basePrice * 0.8).toLocaleString()}`, savings: '20% OFF', highlight: false }
    ];
  };

  useEffect(() => {
    const fetchProductAndAuction = async () => {
      try {
        // Fetch auctions to check if this product is on auction
        const auctionsRes = await axios.get(`${BACKEND_URL}/api/auctions`);
        if (auctionsRes.data.success) {
          const auction = auctionsRes.data.data.find(a => a.product?._id === id);
          if (auction) setActiveAuction(auction);
        }

        // Try to find in static products first (numeric IDs)
        const staticProd = staticProducts.find(p => p.id === parseInt(id));
        if (staticProd) {
          const formattedStatic = {
            ...staticProd,
            bulkDeals: getBulkDeals(staticProd.price, staticProd.bulkDeals)
          };
          setProduct(formattedStatic);
          setSelectedColor(formattedStatic.colors?.[0]?.name || 'Default');
          setSelectedStorage(formattedStatic.storageOptions?.[0] || 'Standard');
          setLoading(false);
          return;
        }

        // Otherwise fetch from backend (MongoDB ObjectIDs)
        const res = await axios.get(`${BACKEND_URL}/api/products/${id}`);
        if (res.data.success) {
          const p = res.data.data;
          
          // Smart feature generator based on category
          const getSmartDetails = (category, name) => {
            const cat = category?.toLowerCase() || '';
            const highlights = ['Premium Quality', 'Verified Seller'];
            const features = [];
            const specs = [
              { label: 'Category', value: category },
              { label: 'Condition', value: 'Brand New' },
              { label: 'Seller', value: p.seller?.name || p.seller?.storeName || 'ZyLora Verified' }
            ];

            if (cat === 'agri' || cat === 'grocery') {
              highlights.push('100% Organic', 'Farm Fresh');
              features.push(
                { title: 'Direct from Farm', desc: 'Sourced directly from certified farmers to ensure maximum freshness.' },
                { title: 'Quality Tested', desc: 'Each batch undergoes rigorous quality checks for moisture and purity.' }
              );
              specs.push({ label: 'Origin', value: 'Local Produce' }, { label: 'Shelf Life', value: '6-12 Months' });
            } else if (cat === 'electronics') {
              highlights.push('Brand Warranty', 'Next-Day Delivery');
              features.push(
                { title: 'Genuine Product', desc: '100% authentic item with full manufacturer warranty support.' },
                { title: 'High Performance', desc: 'Engineered for durability and peak efficiency in its class.' }
              );
              specs.push({ label: 'Warranty', value: '1 Year Brand Warranty' }, { label: 'Box Contents', value: 'Main Unit, User Manual, Accessories' });
            } else if (cat === 'fashion') {
              highlights.push('Easy Returns', 'Premium Fabric');
              features.push(
                { title: 'Modern Design', desc: 'Crafted following the latest trends for the modern professional.' },
                { title: 'Comfort First', desc: 'Breathable materials designed for all-day wearability.' }
              );
              specs.push({ label: 'Material', value: 'Premium Grade' }, { label: 'Care', value: 'Machine Washable' });
            } else {
              highlights.push('Secure Shipping', 'Best Price');
              features.push(
                { title: 'Premium Choice', desc: 'Carefully curated selection meeting ZyLora high standards.' },
                { title: 'Customer Favorite', desc: 'One of our most requested items with high satisfaction ratings.' }
              );
            }

            return { highlights, features, specs };
          };

          const smartDetails = getSmartDetails(p.category, p.name);

          const formattedProd = {
            id: p._id,
            name: p.name,
            price: p.price,
            oldPrice: Math.floor(p.price * (1.1 + Math.random() * 0.3)),
            images: p.images,
            description: p.description || `This high-quality ${p.name} is carefully selected for the ZyLora marketplace. It represents the best in its class, offering exceptional value and reliability for our customers.`,
            category: p.category,
            stock: p.stock,
            rating: (4 + Math.random()).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 500) + 50,
            totalReviews: Math.floor(Math.random() * 2000) + 100,
            discount: `${Math.floor(15 + Math.random() * 20)}% OFF`,
            colors: p.colors || [{ name: 'Default', class: 'bg-black' }],
            storageOptions: p.variants || ['Standard'],
            highlights: smartDetails.highlights,
            features: smartDetails.features,
            specs: smartDetails.specs,
            seller: {
              name: p.seller?.name || p.seller?.storeName || 'Verified Seller',
              initials: (p.seller?.name || p.seller?.storeName || 'VS').substring(0, 2).toUpperCase(),
              isCertified: true,
              platformRating: '4.8'
            },
            bulkDeals: getBulkDeals(p.price),
            frequentlyBought: [],
            similarModels: []
          };
          setProduct(formattedProd);
          setSelectedColor('Default');
          setSelectedStorage('Standard');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndAuction();
  }, [id, BACKEND_URL]);

  const [isWishlisted, setIsWishlisted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        product: product,
        price: product.price,
        quantity: quantity
      } 
    });
  };

  const handleNegotiationNavigation = () => {
    if (isSeller) {
      navigate('/seller-negotiations');
      return;
    }

    navigate(`/negotiate/${product.id}`);
  };

  const showNegotiateButton = () => {
    if (product.price <= 500) return quantity >= 10;
    if (product.price <= 1000) return quantity >= 8;
    return quantity >= 7;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-12">
      <Header />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link 
          to={isSeller ? '/seller-dashboard' : '/'} 
          className="hover:text-blue-600"
        >
          {isSeller ? 'Dashboard' : 'Home'}
        </Link> <ChevronRight size={12} />
        <span>{product.category || 'Products'}</span> <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 order-2 md:order-1">
            {product.images?.map((img, i) => (
              <div 
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 cursor-pointer overflow-hidden bg-white flex items-center justify-center p-1 ${selectedImg === i ? 'border-blue-600' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-8 relative order-1 md:order-2 aspect-square md:aspect-auto">
            <img src={product.images[selectedImg]} alt={product.name} className="max-w-full max-h-full object-contain" />
            <button 
              onClick={() => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)}
              className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md transition-colors ${isInWishlist(id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={20} fill={isInWishlist(id) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">
            <span className="bg-blue-50 px-2 py-0.5 rounded">{product.brand || 'Premium'}</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded">Verified Seller</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold">
              {product.rating} <Star size={14} fill="white" />
            </div>
            <span className="text-sm text-gray-500 font-medium">{product.reviewsCount.toLocaleString()} Ratings & {product.totalReviews.toLocaleString()} Reviews</span>
          </div>

          <div className="mt-6 border-b border-gray-100 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">&#8377;{product.price.toLocaleString()}</span>
              <span className="text-lg text-gray-400 line-through">&#8377;{product.oldPrice.toLocaleString()}</span>
              <span className="text-green-600 font-bold">{product.discount}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-semibold">
              <Truck size={16} /> In Stock & Ready to Ship
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Deliver to: <span className="text-gray-900 font-bold border-b border-dotted border-gray-900 cursor-pointer">400001</span> 
              <span className="ml-4 font-medium text-gray-900">Tomorrow, 11 AM</span>
            </div>
          </div>

          {/* Selection */}
          <div className="py-6 space-y-6">
            {product.category?.toLowerCase() !== 'books' && product.category?.toLowerCase() !== 'agri' && product.category?.toLowerCase() !== 'grocery' && (
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color</span>
                <div className="flex gap-3 mt-3">
                  {product.colors?.map((color, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all ${selectedColor === color.name ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                    >
                      <div className={`w-full h-full rounded-full ${color.class}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {(() => {
                  const cat = product.category?.toLowerCase();
                  if (cat === 'books') return 'Format / Edition';
                  if (cat === 'fashion' || cat === 'sports') return 'Size Selection';
                  if (cat === 'agri') return 'Quantity / Weight';
                  if (cat === 'furniture' || cat === 'home') return 'Configuration';
                  return 'Storage / RAM';
                })()}
              </span>
              <div className="flex gap-3 mt-3">
                {product.storageOptions?.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedStorage(opt)}
                    className={`px-6 py-2 rounded-lg border-2 text-sm font-bold transition-all ${selectedStorage === opt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">QTY</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 text-gray-500 border-r border-gray-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-2 font-bold text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 text-gray-500 border-l border-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {activeAuction ? (
            <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Clock className="text-red-600 animate-pulse" size={18} />
                  </div>
                  <h3 className="font-bold text-red-900 uppercase tracking-wider text-xs">Live Auction Active</h3>
                </div>
                <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">ENDING SOON</div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Current Highest Bid</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">&#8377;{activeAuction.currentBid.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-400">/ Unit</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900 mb-1">{activeAuction.bids?.length || 0} Total Bids</div>
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Bidding Live</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/agri-auctions')}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
              >
                Go to Live Auction Page
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={handleAddToCart}
                  className="bg-[#0A1628] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> ADD TO CART
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                >
                  BUY NOW
                </button>
              </div>

              {showNegotiateButton() && (
                <button 
                  onClick={handleNegotiationNavigation}
                  className="w-full mt-4 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 border-2 border-teal-500"
                >
                  <MessageSquare size={18} /> {isSeller ? 'VIEW NEGOTIATIONS' : 'NEGOTIATE PRICE'}
                </button>
              )}
            </>
          )}

          {/* Bulk Pricing Card */}
          <div className="mt-8 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[32px] p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#DCFCE7] p-2 rounded-xl">
                  <Truck className="text-[#166534]" size={20} />
                </div>
                <h3 className="font-bold text-[#166534] text-xl">Bulk Pricing Deals</h3>
              </div>
              <div className="p-1.5 hover:bg-green-100 rounded-full transition-colors cursor-pointer">
                <Info size={20} className="text-[#166534]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-3 text-[10px] font-black text-[#166534]/60 uppercase tracking-[0.2em] pb-3 px-3">
                <span>Quantity</span>
                <span className="text-center">Price / Unit</span>
                <span className="text-right">Savings</span>
              </div>
              {product.bulkDeals?.map((deal, i) => (
                <div 
                  key={i} 
                  className={`grid grid-cols-3 text-sm py-4 px-4 rounded-2xl font-bold transition-all duration-300 ${deal.highlight ? 'bg-white shadow-xl shadow-green-900/5 text-blue-600 border-2 border-blue-50 scale-[1.02]' : 'text-[#166534]'}`}
                >
                  <span>{deal.range}</span>
                  <span className="text-center">{deal.price}</span>
                  <span className={`text-right ${deal.savings.includes('%') ? 'text-[#16A34A]' : 'text-[#166534]/50'}`}>
                    {deal.savings}
                  </span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleNegotiationNavigation}
              className="w-full mt-8 bg-[#0D9488] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0F766E] transition-all shadow-xl shadow-teal-500/20 active:scale-95"
            >
              <MessageSquare size={18} /> {isSeller ? 'View Bulk Negotiations' : 'Make Bulk Offer'}
            </button>
          </div>
        </div>
      </main>

      {/* Tabs & Additional Info */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specifications', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${product.reviewsCount || 0})` },
            { id: 'seller', label: 'Seller Information' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-8">
          {/* Main Tab Content */}
          <div className="lg:col-span-8">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold mb-6">Product Overview</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-12">
                  {product.features?.map((feature, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-2xl flex gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm h-fit">
                        {i === 0 ? <Clock className="text-blue-600" size={24} /> : <Star className="text-blue-600" size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{feature.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-bold mb-6">Technical Specifications</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specs?.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 font-bold text-gray-500 w-1/3 border-r border-gray-100">{spec.label}</td>
                          <td className="px-6 py-4 text-gray-900">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                <p className="text-gray-500 mt-2">Showing {product.reviewsCount} verified ratings</p>
                <div className="mt-8 space-y-4 max-w-lg mx-auto">
                   {[5, 4, 3, 2, 1].map(star => (
                     <div key={star} className="flex items-center gap-4">
                       <span className="text-xs font-bold text-gray-600 w-4">{star}</span>
                       <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-amber-400" style={{ width: `${star === 5 ? 85 : star === 4 ? 12 : 1}%` }}></div>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 w-10">{star === 5 ? '85%' : star === 4 ? '12%' : '1%'}</span>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'seller' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-gray-900 rounded-3xl p-8 text-white">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black backdrop-blur-xl">
                      {product.seller?.initials || 'VS'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{product.seller?.name || 'Verified Seller'}</h3>
                      <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">
                        {product.seller?.isCertified ? 'Platinum Certified Partner' : 'Identity Verified Seller'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Success Rate</p>
                      <p className="text-xl font-bold">99.8%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">On-time Delivery</p>
                      <p className="text-xl font-bold">100%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform Rating</p>
                      <p className="text-xl font-bold">{product.seller?.platformRating || '4.5'}/5.0</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Seller Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seller Information</h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center rounded-xl font-bold text-xl">
                  {product.seller?.initials || 'VS'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold">{product.seller?.name || 'Verified Seller'}</h5>
                    {product.seller?.isCertified && <ShieldCheck size={16} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-blue-600 font-medium">{product.seller?.isCertified ? 'Certified Bulk Seller' : 'Verified Seller'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-y border-gray-50 mb-6">
                <span className="text-gray-500">Platform Rating</span>
                <span className="font-bold text-gray-900">{product.seller?.platformRating || '4.5'} <span className="text-gray-300 font-normal">/ 5</span></span>
              </div>
              <button className="w-full border border-gray-200 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                Visit Store Profile
              </button>
            </div>

            {/* Frequently Bought Together */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Frequently Bought Together</h4>
              <div className="space-y-4">
                {product.frequentlyBought?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <img src={item.img} alt="" className="w-10 h-10 object-contain" />
                      <div>
                        <h6 className="text-[10px] font-bold text-gray-900">{item.name}</h6>
                        <p className="text-xs font-bold text-blue-600">{item.price}</p>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-400">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Similar Models */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Explore Similar Models</h2>
            <p className="text-sm text-gray-500 mt-1">Based on your browsing history</p>
          </div>
          <button 
            onClick={() => navigate(`/category/${product.category}`)}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            View All {product.category} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.similarModels?.map((prod, i) => (
            <div 
              key={i} 
              className="group cursor-pointer"
              onClick={() => {
                navigate(`/product/${prod.id}`);
                window.scrollTo(0, 0);
              }}
            >
              <div className="aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-6 mb-4 group-hover:shadow-md transition-all">
                <img src={prod.img} alt="" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</span>
              <h3 className="font-bold text-sm mt-1">{prod.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold">&#8377;{prod.price}</span>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{prod.discount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default ProductDetail;
