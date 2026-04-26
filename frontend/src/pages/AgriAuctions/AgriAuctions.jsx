import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Clock, Star, ShieldCheck, 
  Truck, RotateCcw, Headset, ArrowRight,
  Gavel, Info, Filter, ArrowUpRight, CheckCircle2, MapPin
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';

const AgriAuctions = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [activeFilter, setActiveFilter] = useState('All Produce');

  const filters = ['All Produce', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Organic Certified', 'Export Quality'];

  const liveBids = [
    { id: 1, user: 'Sunil Traders', amount: 1850, time: '2 mins ago' },
    { id: 2, user: 'Global Fresh Exports', amount: 1825, time: '5 mins ago' },
    { id: 3, user: 'Mandi King Co.', amount: 1800, time: '8 mins ago' },
    { id: 4, user: 'Freshway Marts', amount: 1750, time: '12 mins ago' },
  ];

  const auctionItems = [
    {
      id: 1,
      name: 'Long Grain Basmati Paddy',
      location: 'Punjab Harvest - 200 Tons',
      currentBid: 4200,
      unit: 'quintal',
      timeLeft: '04:12:32',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
      tag: 'ETHICAL SOURCING'
    },
    {
      id: 2,
      name: 'Hybrid Desi Tomatoes',
      location: 'Nashik Mandi - 50 Quintals',
      currentBid: 850,
      unit: 'crate',
      timeLeft: '02:15:10',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
      tag: 'FRESH HARVEST'
    },
    {
      id: 3,
      name: 'Organic Finger Turmeric',
      location: 'Erode District - 10 Tons',
      currentBid: 12400,
      unit: 'quintal',
      timeLeft: '03:52:15',
      image: 'https://images.unsplash.com/photo-1615485242231-62863806a693?auto=format&fit=crop&q=80&w=400',
      tag: 'EXPORT READY'
    },
    {
      id: 4,
      name: 'Red Onions (Large)',
      location: 'Lasalgaon - 40 Tons',
      currentBid: 1850,
      unit: 'quintal',
      timeLeft: '01:25:00',
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=400',
      tag: 'BULK DEALS'
    },
    {
      id: 5,
      name: 'Masoor Dal (Unpolished)',
      location: 'MP Central - 25 Tons',
      currentBid: 6800,
      unit: 'quintal',
      timeLeft: '05:40:12',
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400',
      tag: 'PREMIUM QUALITY'
    },
    {
      id: 6,
      name: 'Fresh Winter Cabbage',
      location: 'Ooty Farms - 15 Quintals',
      currentBid: 420,
      unit: 'quintal',
      timeLeft: '03:12:55',
      image: 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?auto=format&fit=crop&q=80&w=400',
      tag: 'LOCAL PICKUP'
    }
  ];

  const closedAuctions = [
    { commodity: 'Kashmiri Apples (Box)', seller: 'Valley Orchards', finalBid: 1250, volume: '800 Boxes', status: 'SOLD' },
    { commodity: 'Soybean Grains', seller: 'Indore Agri Coop', finalBid: 5100, volume: '45 Tons', status: 'SOLD' },
    { commodity: 'Green Grapes (Seedless)', seller: 'Sangli Exports', finalBid: 95, volume: '12 Tons', status: 'UNSOLD' },
    { commodity: 'Organic Coffee Beans', seller: 'Coorg Estates', finalBid: 38000, volume: '2 Tons', status: 'SOLD' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">Agri Auctions</span>
        </div>

        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-900 to-green-700 h-[300px] mb-8"
        >
          <img 
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1200" 
            alt="Agri Auctions" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
          <div className="absolute inset-0 p-12 flex items-center justify-between">
            <div className="max-w-lg space-y-6">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Live Now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">ZyLora Fresh Auctions</h1>
              <p className="text-green-50 text-sm font-medium leading-relaxed">
                Direct from premium Bharat farms. Real-time bidding for wholesale quantities of seasonal harvests.
              </p>
              <div className="bg-green-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <Info size={16} className="text-green-400 mt-0.5" />
                <p className="text-[10px] text-green-100/80 font-medium">
                  All auction prices are inclusive of mandi tax where applicable. Transportation cost to be calculated post-win.
                </p>
              </div>
            </div>
            <div className="hidden lg:block w-72 h-72 rounded-2xl overflow-hidden rotate-3 shadow-2xl border-8 border-white/10">
              <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600" alt="Fresh Produce" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter 
                  ? 'bg-[#0A1628] text-white shadow-lg' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Featured Auction */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col md:row"
            >
              <div className="md:w-2/5 relative">
                <img 
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600" 
                  alt="Featured" 
                  className="w-full h-full object-cover min-h-[250px]"
                />
                <div className="absolute top-4 left-4 bg-[#0A1628] text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Featured Harvest</div>
              </div>
              <div className="p-8 flex-1 relative">
                <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">
                  <Clock size={14} className="animate-pulse" />
                  <span className="text-xs font-black font-mono tracking-widest">00:42:18</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif font-black text-gray-900 leading-tight">
                    Large Alphonso Mangoes (Grade A)
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <MapPin size={14} />
                    <span>Ratnagiri, Maharashtra • 50 Crates</span>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Highest Bid</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-green-600">₹1,850</span>
                        <span className="text-xs font-bold text-gray-400">/ Crate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-900 mb-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        24 Active Bidders
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lot Size: 2500 Units</span>
                    </div>
                  </div>
                  <button className="w-full bg-[#10B981] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-green-500/20 mt-4">
                    Place Bid Now
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Ticker Bar */}
            <div className="bg-[#10B981] text-white rounded-2xl p-4 flex items-center gap-6 overflow-hidden relative">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ending in next hour</span>
              </div>
              <div className="flex gap-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest animate-marquee">
                <span>🌾 Basmati Paddy (200 Tons) • 04:12</span>
                <span>🍅 Hybrid Tomatoes (50 Qntls) • 12:45</span>
                <span>🍠 Organic Turmeric (10 Tons) • 32:10</span>
                <span>🧅 Red Onions (40 Tons) • 05:22</span>
              </div>
            </div>

            {/* Auction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {auctionItems.map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0A1628] text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      {item.tag}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                      {item.timeLeft}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-black text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{item.location}</p>
                      
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Current Bid</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-gray-900">₹{item.currentBid.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400">/{item.unit}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Bidding Live</span>
                      </div>
                    </div>
                    <button className="w-full border-2 border-[#10B981] text-[#10B981] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-all">
                      Bid Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Feed */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Live Bids Feed */}
            <div className="bg-[#0A1628] rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-xl font-bold italic">Live Bids Feed</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-6">
                {liveBids.map((bid) => (
                  <motion.div 
                    key={bid.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="text-[11px] font-black text-white leading-none mb-1">{bid.user}</div>
                      <div className="text-[9px] font-medium text-gray-500 uppercase">{bid.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-500">₹{bid.amount.toLocaleString()}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                  Verified Auction Records Active
                </p>
              </div>
            </div>

            {/* Seller Registration Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gavel size={32} className="text-[#10B981]" />
              </div>
              <h4 className="font-serif font-black text-gray-900 mb-2">Want to list your produce?</h4>
              <p className="text-xs text-gray-500 font-medium mb-6">Join 5,000+ verified farmers selling globally.</p>
              <button className="w-full bg-[#0A1628] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                Register as Seller
              </button>
            </div>
          </aside>
        </div>

        {/* Recently Closed Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-black text-gray-900">Recently Closed Auctions</h2>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              View Archive <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commodity', 'Seller', 'Final Bid', 'Volume', 'Status'].map((header) => (
                    <th key={header} className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {closedAuctions.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-sm font-bold text-gray-900">{row.commodity}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-500">{row.seller}</td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-green-600">₹{row.finalBid.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-900">{row.volume}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        row.status === 'SOLD' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">ZyLora</h2>
            <p className="text-gray-400 text-[10px] leading-relaxed max-w-xs font-medium uppercase tracking-widest">
              Redefining the agricultural marketplace through transparent negotiations and secure auctions.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Marketplace</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Live Auctions</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Auctions</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Current Lots</li>
              <li className="hover:text-amber-500 cursor-pointer">Auction Calendar</li>
              <li className="hover:text-amber-500 cursor-pointer">Selling Portal</li>
              <li className="hover:text-amber-500 cursor-pointer">Bidding Rules</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              {/* Social icons */}
            </div>
            <p className="text-[8px] text-gray-500 mt-12 uppercase tracking-widest font-black">© 2024 ZYLORA. EMPOWERING BHARAT'S AGRICULTURE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgriAuctions;
