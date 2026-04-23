import React, { useState } from 'react';
import { 
  Search, Menu, ShoppingCart, Heart, User, 
  ChevronRight, Star, Clock, ShieldCheck, 
  Truck, RotateCcw, MessageSquare, Info,
  Plus, Minus, Share2, Store, ArrowLeft, LogOut
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  
  // Find product by ID from data file
  const productData = products.find(p => p.id === parseInt(id)) || products[0];

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(productData.colors[0].name);
  const [selectedStorage, setSelectedStorage] = useState(productData.storageOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const product = productData;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Optional: navigate to cart or show a toast
    // navigate('/cart');
  };

  const showNegotiateButton = () => {
    if (product.price <= 500) return quantity >= 10;
    if (product.price <= 1000) return quantity >= 8;
    return quantity >= 7;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-12">
      {/* Main Header (Reused from Home) */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white">
              <Menu size={18} /> Categories
            </button>
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
                <a href="#" className="hover:text-white transition-colors">Become a Seller</a>
                <Link to="/agri-auctions" className="hover:text-white transition-colors">Agri Auctions</Link>
            </div>
          </div>
          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search devices, bulk stock..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="hidden md:flex items-center gap-4">
              <Heart size={20} className="cursor-pointer hover:text-white" />
              <User 
                size={20} 
                className="cursor-pointer hover:text-white" 
                onClick={() => navigate('/profile')}
              />
              <div 
                className="relative cursor-pointer hover:text-white text-amber-500"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-amber-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Home</Link> <ChevronRight size={12} />
        <span>Mobiles</span> <ChevronRight size={12} />
        <span>Samsung</span> <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">Galaxy M34 5G</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 order-2 md:order-1">
            {product.images.map((img, i) => (
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
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">
            <span className="bg-blue-50 px-2 py-0.5 rounded">Samsung</span>
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
              <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              <span className="text-lg text-gray-400 line-through">₹{product.oldPrice.toLocaleString()}</span>
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
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color</span>
              <div className="flex gap-3 mt-3">
                {product.colors.map((color, i) => (
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

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Storage / RAM</span>
              <div className="flex gap-3 mt-3">
                {product.storageOptions.map((opt, i) => (
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

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleAddToCart}
              className="bg-[#0A1628] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> ADD TO CART
            </button>
            <button className="bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors">
              BUY NOW
            </button>
          </div>

          {showNegotiateButton() && (
            <button 
              onClick={() => navigate(`/negotiate/${product.id}`)}
              className="w-full mt-4 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 border-2 border-teal-500"
            >
              <MessageSquare size={18} /> NEGOTIATE PRICE
            </button>
          )}

          {/* Bulk Pricing Card */}
          <div className="mt-8 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Truck className="text-green-600" size={18} />
                </div>
                <h3 className="font-bold text-green-900">Bulk Pricing Deals</h3>
              </div>
              <Info size={16} className="text-green-600 cursor-pointer" />
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-[10px] font-bold text-green-700/60 uppercase tracking-widest pb-2 px-2">
                <span>Quantity</span>
                <span>Price / Unit</span>
                <span className="text-right">Savings</span>
              </div>
              {product.bulkDeals.map((deal, i) => (
                <div 
                  key={i} 
                  className={`grid grid-cols-3 text-sm py-2 px-3 rounded-lg font-medium ${deal.highlight ? 'bg-white shadow-sm text-blue-600 border border-blue-100' : 'text-green-800'}`}
                >
                  <span>{deal.range}</span>
                  <span className="font-bold">{deal.price}</span>
                  <span className={`text-right font-bold ${deal.savings.includes('%') ? 'text-green-600' : 'text-gray-400'}`}>
                    {deal.savings}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate(`/negotiate/${product.id}`)}
              className="w-full mt-6 bg-[#0D9488] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0F766E] transition-colors shadow-lg shadow-teal-500/20"
            >
              <MessageSquare size={18} /> Make Bulk Offer
            </button>
          </div>
        </div>
      </main>

      {/* Tabs & Additional Info */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex border-b border-gray-200">
          {['Description', 'Specifications', 'Reviews (1,200)', 'Seller Information'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-8">
          {/* Main Tab Content */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Experience Super AMOLED</h2>
            <p className="text-gray-600 leading-relaxed">
              The Samsung Galaxy M34 5G features a stunning 6.5-inch Super AMOLED display with a 120Hz refresh rate, bringing every frame to life with vibrant colors and fluid motion. Whether you're streaming professional agriculture training videos or managing your auction listings, the Vision Booster ensures visibility even under direct sunlight.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {product.features.map((feature, i) => (
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

            <div className="mt-12">
              <h3 className="text-xl font-bold mb-6">Technical Specifications</h3>
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 font-bold text-gray-500 w-1/3 border-r border-gray-100">{spec.label}</td>
                        <td className="px-6 py-4 text-gray-900">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Seller Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seller Information</h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center rounded-xl font-bold text-xl">
                  {product.seller.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold">{product.seller.name}</h5>
                    {product.seller.isCertified && <ShieldCheck size={16} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-blue-600 font-medium">{product.seller.isCertified ? 'Certified Bulk Seller' : 'Verified Seller'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-y border-gray-50 mb-6">
                <span className="text-gray-500">Platform Rating</span>
                <span className="font-bold text-gray-900">{product.seller.platformRating} <span className="text-gray-300 font-normal">/ 5</span></span>
              </div>
              <button className="w-full border border-gray-200 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                Visit Store Profile
              </button>
            </div>

            {/* Frequently Bought Together */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Frequently Bought Together</h4>
              <div className="space-y-4">
                {product.frequentlyBought.map((item, i) => (
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
          <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
            View All Mobiles <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.similarModels.map((prod, i) => (
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
                <span className="font-bold">₹{prod.price}</span>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{prod.discount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer (Simplified from image) */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ZyLora</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The premium professional marketplace for consumer electronics and agricultural utility devices. Bridging the gap with curated bulk deals and verified quality.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700">
                <Share2 size={16} />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700">
                <MessageSquare size={16} />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700">
                <Store size={16} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-amber-500 cursor-pointer">About Zylora</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Categories</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-amber-500 cursor-pointer">Mobile Devices</li>
              <li className="hover:text-amber-500 cursor-pointer">Agri-Tech Tools</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Stock</li>
              <li className="hover:text-amber-500 cursor-pointer">Live Auctions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Market Insight</h4>
            <p className="text-xs text-gray-500 mb-6">Reliable, professional, and precise. ZyLora is the bridge we needed for our corporate bulk procurement.</p>
            <div className="bg-gray-900 p-1 rounded-lg flex border border-gray-800">
              <input type="email" placeholder="Email for Deal Alerts" className="bg-transparent text-xs px-4 py-2 outline-none flex-1" />
              <button className="bg-amber-500 text-white px-4 py-2 rounded-md font-bold text-xs hover:bg-amber-600">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <p>© 2026 ZYLORA PROFESSIONAL MARKETPLACE & AGRICULTURAL EXCHANGE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
