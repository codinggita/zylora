import React from 'react';
import { 
  Search, Menu, ShoppingCart, Heart, User, 
  ChevronRight, Clock, Star, ShieldCheck, 
  Truck, RotateCcw, Headset, ArrowRight, LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';

const Home = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-[#0A1628] text-white text-[10px] md:text-xs py-2 px-4 flex justify-center items-center gap-4">
        <span>🚚 Free delivery on orders above ₹1299</span>
        <span className="hidden md:inline">|</span>
        <Link to="/agri-auctions" className="text-amber-500 font-semibold cursor-pointer">🌾 Agri Auctions Live Now →</Link>
      </div>

      {/* Main Header */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Categories */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              <Menu size={18} />
              Categories
            </button>
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
                <a href="#" className="hover:text-white transition-colors">Become a Seller</a>
                <Link to="/agri-auctions" className="hover:text-white transition-colors">Agri Auctions</Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search for premium goods or agri-auctions..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </div>

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
            <div className="flex items-center gap-4 text-gray-300">
              <Heart size={20} className="cursor-pointer hover:text-white" />
              <div 
                className="relative cursor-pointer hover:text-white"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
              </div>
              <User 
                size={20} 
                className="cursor-pointer hover:text-white" 
                onClick={() => navigate('/profile')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[500px] bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
          alt="Agri Field" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-xl">
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Limited Period Live</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 leading-tight font-serif">
                Sustainable Farming,<br /> Global Reach.
              </h1>
              <p className="text-gray-300 mt-4 text-sm md:text-lg">
                Participate in live auctions for premium organic grains and artisanal produce directly from verified farmers.
              </p>
              <div className="flex gap-4 mt-8">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                  Enter Auction
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-3 rounded-lg font-bold border border-white/30 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-8 h-1 bg-white rounded-full"></div>
          <div className="w-8 h-1 bg-white/30 rounded-full"></div>
          <div className="w-8 h-1 bg-white/30 rounded-full"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Shop by Category</h2>
          <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 md:gap-8">
            {[
              { name: 'Electronics', icon: '💻' },
              { name: 'Fashion', icon: '👕' },
              { name: 'Agri', icon: '🌾' },
              { name: 'Home', icon: '🏠' },
              { name: 'Furniture', icon: '🪑' },
              { name: 'Sports', icon: '⚽' },
              { name: 'Beauty', icon: '💄' },
              { name: 'Toys', icon: '🧸' },
              { name: 'Books', icon: '📚' },
              { name: 'Grocery', icon: '🍎' },
              { name: 'More', icon: '...' },
            ].map((cat, i) => (
              <div 
                key={i} 
                onClick={() => cat.name !== 'More' && navigate(`/category/${cat.name}`)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-xl group-hover:shadow-md transition-all border border-gray-100">
                {cat.icon}
              </div>
              <span className="text-[10px] md:text-xs font-medium text-gray-600 group-hover:text-blue-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Deals */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-bold">Today's Deals</h2>
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <Clock size={14} />
              ENDS IN: 12h : 44m : 24s
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((prod, i) => (
              <div 
                key={i} 
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${prod.id}`)}
              >
                <div className="relative aspect-square bg-[#F3F4F6] rounded-xl overflow-hidden mb-4">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded">{prod.discount}</span>
                  <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <ShoppingCart size={18} className="text-gray-900" />
                  </button>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{prod.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(prod.rating) ? "currentColor" : "none"} />)}
                  <span className="text-[10px] text-gray-400 ml-1">({prod.rating})</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">₹{prod.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">₹{prod.oldPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Banners */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/category/Electronics')}
          className="relative h-[250px] rounded-2xl overflow-hidden group cursor-pointer"
        >
          <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800" alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Next Gen Tech</span>
            <h2 className="text-2xl font-bold text-white mt-2">Up to 40% off on premium laptops<br />and tablets.</h2>
            <button className="bg-white text-gray-900 w-fit mt-6 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
              Shop Electronics
            </button>
          </div>
        </div>
        <div 
          onClick={() => navigate('/category/Fashion')}
          className="relative h-[250px] rounded-2xl overflow-hidden group cursor-pointer"
        >
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800" alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Spring Summer '24</span>
            <h2 className="text-2xl font-bold text-white mt-2">The new collection curated for<br />professional lifestyle.</h2>
            <button className="bg-white text-gray-900 w-fit mt-6 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
              Explore Fashion
            </button>
          </div>
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-amber-500 font-bold">👑</span>
          <h2 className="text-xl font-bold">Top-Rated Products</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Nike Pegasus 40', price: '11,995', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', tag: 'TRUSTED SELLER' },
            { name: 'Prestige Pressure Cooker', price: '1,795', img: 'https://images.unsplash.com/photo-1584990344610-b2b12f4d2bca?auto=format&fit=crop&q=80&w=400', tag: 'PREMIUM QUALITY' }
          ].map((prod, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl flex gap-6 items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {prod.tag}
                </span>
                <h3 className="font-bold text-lg mt-1">{prod.name}</h3>
                <p className="text-xl font-black mt-2">₹{prod.price}</p>
                <button className="mt-4 bg-[#0A1628] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#15233D] transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agri Live Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-[#052E16] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-green-400">Live Auctions</span>
              </div>
              <h2 className="text-3xl font-bold">ZyLora Fresh Auctions</h2>
              <p className="text-green-200 mt-2">Premium quality produce directly from organic certified farms.</p>
            </div>
            <button className="bg-white text-[#052E16] px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-green-50 transition-colors">
              View All Batches <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              { name: 'Lot #A24: Arabica Beans', price: '1,42,500', time: '02 : 15 : 49', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400', bids: '12 Bids' }
            ].map((auction, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                  <img src={auction.img} alt={auction.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">LIVE</span>
                </div>
                <h3 className="font-bold text-lg">{auction.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-[10px] text-green-300 uppercase font-bold">Current Bid</span>
                    <p className="text-xl font-bold">₹{auction.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-green-300 uppercase font-bold">Ends In</span>
                    <p className="text-sm font-mono font-bold text-amber-400">{auction.time}</p>
                  </div>
                </div>
                <button className="w-full bg-green-400 hover:bg-green-500 text-[#052E16] mt-6 py-3 rounded-xl font-bold transition-colors">
                  Place Bid
                </button>
              </div>
            ))}
          </div>
          
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 blur-[100px] rounded-full"></div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-b border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Truck size={24} className="text-amber-500" />, title: 'Swift Delivery', desc: 'Across 20,000+ pin codes' },
            { icon: <ShieldCheck size={24} className="text-amber-500" />, title: 'Secure Payments', desc: '100% protected checkout' },
            { icon: <RotateCcw size={24} className="text-amber-500" />, title: 'Easy Returns', desc: '7-day replacement policy' },
            { icon: <Headset size={24} className="text-amber-500" />, title: '24/7 Assistance', desc: 'Expert support at your call' }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="bg-amber-500/10 p-3 rounded-xl">{item.icon}</div>
              <div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">ZyLora</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The premium marketplace bridging the gap between direct agri-auctions and modern retail experience. Curated quality at scale.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-sm mb-6 text-amber-500 uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">About Zylora</li>
              <li className="hover:text-white cursor-pointer transition-colors">Agri-Auctions</li>
              <li className="hover:text-white cursor-pointer transition-colors">Become a Seller</li>
              <li className="hover:text-white cursor-pointer transition-colors">Sustainability</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-amber-500 uppercase tracking-widest">Help Center</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Shipping Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bulk Discounts</li>
              <li className="hover:text-white cursor-pointer transition-colors">Returns & Refunds</li>
              <li className="hover:text-white cursor-pointer transition-colors">FAQs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-amber-500 uppercase tracking-widest">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Get updates on new auction lots and seasonal sales.</p>
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <input type="email" placeholder="Your email" className="bg-transparent border-none focus:ring-0 text-sm flex-1 px-3" />
              <button className="bg-amber-500 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-amber-600 transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500">© 2024 ZyLora. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] text-gray-500">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Internal components to handle lucide-react name differences
const CheckCircle2 = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Home;
