import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Clock, Star, ShieldCheck, 
  Truck, RotateCcw, Headset, ArrowRight, CheckCircle2,
  ShoppingCart, TrendingUp, Store
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { products as staticProducts } from '../../data/products';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [timers, setTimers] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
      tag: "Limited Period Live",
      title: <>Sustainable Farming,<br /> <span className="text-amber-500">Global Reach.</span></>,
      description: "Participate in live auctions for premium organic grains and artisanal produce directly from verified farmers.",
      buttonText: "Enter Auction",
      color: "amber",
      accentClass: "bg-amber-500",
      shadowClass: "shadow-amber-500/40"
    },
    {
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=2000",
      tag: "Exclusive Tech Deals",
      title: <>Next-Gen Tech,<br /> <span className="text-blue-500">Unbeatable Prices.</span></>,
      description: "Upgrade your professional setup with up to 40% off on premium laptops, tablets, and smart devices.",
      buttonText: "Shop Electronics",
      color: "blue",
      accentClass: "bg-blue-500",
      shadowClass: "shadow-blue-500/40"
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000",
      tag: "Summer Collection '24",
      title: <>Modern Style,<br /> <span className="text-rose-500">Professional Edge.</span></>,
      description: "Discover the new season's curated collection designed for the modern professional lifestyle.",
      buttonText: "Explore Fashion",
      color: "rose",
      accentClass: "bg-rose-500",
      shadowClass: "shadow-rose-500/40"
    }
  ];

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  useEffect(() => {
    const socket = io(BACKEND_URL);

    const fetchHomeData = async () => {
      // Fetch products independently so auction failures don't block products
      try {
        const prodRes = await axios.get(`${BACKEND_URL}/api/products`);
        if (prodRes.data.success) {
          const dynamicProducts = prodRes.data.data.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            oldPrice: p.price * 1.2,
            images: p.images && p.images.length > 0 ? p.images : ['https://placehold.co/300x300/f3f4f6/9ca3af'],
            rating: 4.5,
            discount: '15% OFF',
            isDynamic: true
          }));
          setProducts(dynamicProducts.length > 0 ? dynamicProducts : staticProducts);
        } else {
          setProducts(staticProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }

      // Fetch auctions separately — failure won't affect products
      try {
        const auctionRes = await axios.get(`${BACKEND_URL}/api/auctions`);
        if (auctionRes.data.success) {
          // Filter to only active (not ended) auctions
          const activeAuctions = auctionRes.data.data.filter(
            a => a.status === 'active' || new Date(a.endTime) > new Date()
          );
          setLiveAuctions(activeAuctions);
        }
      } catch (err) {
        console.error('Error fetching auctions:', err);
      }
    };

    fetchHomeData();

    socket.on('auction_bid_updated', (data) => {
      setLiveAuctions(prev => prev.map(a => 
        a._id === data.auctionId ? { ...a, currentBid: data.newBid, bids: data.bids } : a
      ));
    });

    const interval = setInterval(() => {
      const newTimers = {};
      setLiveAuctions(prev => {
        prev.forEach(auction => {
          const end = new Date(auction.endTime).getTime();
          const now = new Date().getTime();
          const diff = end - now;

          if (diff > 0) {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            newTimers[auction._id] = `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
          } else {
            newTimers[auction._id] = 'ENDED';
          }
        });
        setTimers(newTimers);
        return prev;
      });
    }, 1000);

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
      clearInterval(slideInterval);
    };
  }, [BACKEND_URL, heroSlides.length]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-[#0A1628] text-white text-[10px] md:text-xs py-2 px-4 flex justify-center items-center gap-4">
        <span>🚚 Free delivery on orders above &#8377;1299</span>
        <span className="hidden md:inline">|</span>
        <Link to="/agri-auctions" className="text-amber-500 font-semibold cursor-pointer">🌾 Agri Auctions Live Now →</Link>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative h-[450px] md:h-[700px] bg-gray-950 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "linear" }}
              src={heroSlides[currentSlide].image} 
              alt="Promo" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-8 w-full">
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  className="max-w-2xl"
                >
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`${heroSlides[currentSlide].accentClass} text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl ${heroSlides[currentSlide].shadowClass}`}
                  >
                    {heroSlides[currentSlide].tag}
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-4xl sm:text-5xl md:text-8xl font-black text-white mt-8 leading-[1.1] md:leading-[1] font-serif tracking-tight"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-gray-300 mt-8 text-base md:text-2xl leading-relaxed max-w-xl font-medium"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex flex-wrap gap-6 mt-12"
                  >
                    <button 
                      className={`${heroSlides[currentSlide].accentClass} hover:opacity-90 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl ${heroSlides[currentSlide].shadowClass}`}
                    >
                      {heroSlides[currentSlide].buttonText}
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 text-white backdrop-blur-3xl px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all hover:scale-105 active:scale-95">
                      Learn More
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentSlide === i 
                  ? `w-12 ${heroSlides[i].accentClass} shadow-lg ${heroSlides[i].shadowClass}` 
                  : "w-6 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 group"
        >
          <ArrowRight size={24} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 group"
        >
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
          <button className="text-amber-500 text-sm font-bold flex items-center gap-1 hover:text-amber-600 transition-colors group">
            View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex overflow-x-auto pb-6 pt-2 gap-6 md:gap-8 justify-start lg:justify-between snap-x no-scrollbar"
        >
            {[
              { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300' },
              { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=300' },
              { name: 'Agri', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=300' },
              { name: 'Home', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300' },
              { name: 'Furniture', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=300' },
              { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300' },
              { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=300' },
              { name: 'Toys', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=300' },
              { name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300' },
              { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300' },
            ].map((cat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/category/${cat.name}`)}
                className="flex flex-col items-center gap-3 group cursor-pointer snap-start min-w-[72px] md:min-w-[88px]"
              >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-sm group-hover:shadow-xl group-hover:-translate-y-1.5 transition-all duration-300 ring-2 ring-transparent group-hover:ring-amber-400 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <span className="text-[11px] md:text-sm font-bold text-gray-700 group-hover:text-amber-600 transition-colors">{cat.name}</span>
            </motion.div>
          ))}
        </motion.div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {products?.map((prod, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${prod.id}`)}
              >
                <div className="relative aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={prod.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">{prod.discount}</span>
                  <button 
                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 hover:bg-amber-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${prod.id}`);
                    }}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-amber-600 transition-colors">{prod.name}</h3>
                <div className="flex items-center gap-1 mt-1.5 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(prod.rating) ? "currentColor" : "none"} />)}
                  <span className="text-[10px] text-gray-400 font-bold ml-1">{prod.rating}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-black text-gray-900">&#8377;{prod.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through font-medium">&#8377;{prod.oldPrice.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Banners */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => navigate('/category/Electronics')}
          className="relative h-[300px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl"
        >
          <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800" alt="Electronics" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
            <span className="text-amber-500 text-xs font-black uppercase tracking-widest mb-2">Next Gen Tech</span>
            <h2 className="text-3xl font-bold text-white leading-tight">Up to 40% off on premium<br />laptops and tablets.</h2>
            <button className="bg-white text-gray-900 w-fit mt-6 px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95">
              Shop Electronics
            </button>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => navigate('/category/Fashion')}
          className="relative h-[300px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl"
        >
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800" alt="Fashion" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
            <span className="text-amber-500 text-xs font-black uppercase tracking-widest mb-2">Spring Summer '24</span>
            <h2 className="text-3xl font-bold text-white leading-tight">The new collection curated<br />for professional lifestyle.</h2>
            <button className="bg-white text-gray-900 w-fit mt-6 px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95">
              Explore Fashion
            </button>
          </div>
        </motion.div>
      </section>

      {/* Top Rated Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
            <Star size={20} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Top-Rated Selection</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'Nike Pegasus 40', price: '11,995', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', tag: 'TRUSTED SELLER' },
            { name: 'Prestige Pressure Cooker', price: '1,795', img: 'https://images.unsplash.com/photo-1584990344610-b2b12f4d2bca?auto=format&fit=crop&q=80&w=400', tag: 'PREMIUM QUALITY' },
            { name: 'Sony WH-1000XM5', price: '29,990', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400', tag: 'BEST IN TECH' },
            { name: 'Apple iPad Air', price: '54,900', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400', tag: 'LIMITED STOCK' },
            { name: 'Organic Honey Batch #42', price: '850', img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400', tag: 'DIRECT FROM FARM' },
            { name: 'Premium Leather Sofa', price: '45,999', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400', tag: 'LUXURY SELECTION' }
          ].map((prod, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-6 rounded-[24px] flex gap-8 items-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer group"
            >
              <div className="w-36 h-36 bg-gray-50 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-green-600 flex items-center gap-1.5 uppercase tracking-widest bg-green-50 w-fit px-3 py-1 rounded-full mb-3">
                  <CheckCircle2 size={12} /> {prod.tag}
                </span>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors">{prod.name}</h3>
                <p className="text-2xl font-black text-gray-900 mt-2">&#8377;{prod.price}</p>
                <button className="mt-5 bg-[#0A1628] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

        {/* Agri Live Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#052E16] rounded-[48px] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-green-900/20"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">Live Auctions</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">ZyLora Fresh Auctions</h2>
              <p className="text-green-200/70 mt-4 text-lg max-w-xl">Premium quality produce directly from organic certified farms. Bid now for direct-to-farm pricing.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#052E16] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-green-50 transition-all shadow-xl shadow-black/20"
            >
              View All Batches <ArrowRight size={20} />
            </motion.button>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 relative z-10">
            {liveAuctions.length === 0 ? (
              <div className="lg:col-span-3 text-center py-20 bg-white/5 rounded-[48px] border border-dashed border-white/20">
                <p className="text-green-200/50 font-black uppercase tracking-[0.3em] text-sm">No active auctions at the moment</p>
                <button className="mt-8 text-green-400 font-bold hover:underline">Get Notified for Next Batch</button>
              </div>
            ) : (
              <>
                <div className="lg:col-span-1">
                  {liveAuctions.slice(0, 1).map((auction, i) => (
                    <motion.div 
                      key={auction._id} 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      onClick={() => navigate(`/agri-auctions`)}
                      className="bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/10 p-6 group hover:bg-white/15 transition-all duration-500 cursor-pointer h-full"
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
                        <img src={auction.product?.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} alt={auction.product?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-red-500/30 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      </div>
                      <h3 className="font-bold text-2xl group-hover:text-green-400 transition-colors line-clamp-1">{auction.product?.name}</h3>
                      <div className="flex justify-between items-center mt-8 p-4 bg-black/20 rounded-2xl">
                        <div>
                          <span className="text-[10px] text-green-300/60 uppercase font-black tracking-widest">Current Bid</span>
                          <p className="text-2xl font-bold">&#8377;{(auction.currentBid || auction.startingPrice).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-green-300/60 uppercase font-black tracking-widest">Ends In</span>
                          <p className="text-sm font-mono font-bold text-amber-400">{timers[auction._id] || '-- : -- : --'}</p>
                        </div>
                      </div>
                      <button className="w-full bg-green-400 hover:bg-green-500 text-[#052E16] mt-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-400/20">
                        Place Bid Now
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promo Box 1: Why Auctions? */}
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col justify-between hover:bg-white/10 transition-all group">
                    <div>
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 text-amber-500">
                        <TrendingUp size={24} />
                      </div>
                      <h4 className="text-xl font-bold mb-3">Why Buy via Auctions?</h4>
                      <p className="text-green-200/50 text-sm leading-relaxed">
                        Skip the middleman and get transparent, market-driven prices directly from verified farms across India.
                      </p>
                    </div>
                    <ul className="mt-8 space-y-3">
                      {['Real-time Price Discovery', 'Verified Quality Reports', 'Direct Farm-to-Enterprise'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-xs font-bold text-green-300/80 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Promo Box 2: Farmer Trust */}
                  <div className="bg-gradient-to-br from-green-500/10 to-amber-500/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400">
                        <ShieldCheck size={24} />
                      </div>
                      <h4 className="text-xl font-bold mb-3">Verified Sellers</h4>
                      <p className="text-green-200/50 text-sm leading-relaxed mb-6">
                        Every listing is authenticated with soil health cards and batch quality certificates.
                      </p>
                      <button className="text-xs font-black uppercase tracking-widest bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                        Learn Verification Process
                      </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Store size={150} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-b border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: <Truck size={28} className="text-amber-500" />, title: 'Swift Delivery', desc: 'Across 20,000+ pin codes' },
            { icon: <ShieldCheck size={28} className="text-amber-500" />, title: 'Secure Payments', desc: '100% protected checkout' },
            { icon: <RotateCcw size={28} className="text-amber-500" />, title: 'Easy Returns', desc: '7-day replacement policy' },
            { icon: <Headset size={28} className="text-amber-500" />, title: '24/7 Assistance', desc: 'Expert support at your call' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex gap-5 items-center group cursor-default"
            >
              <div className="bg-amber-500/10 p-4 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
