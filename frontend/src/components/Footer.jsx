import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#0A1628] text-white pt-20 pb-10 border-t border-white/5 mt-20 relative">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">ZyLora</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
              The premium marketplace bridging the gap between direct agri-auctions and modern retail experience. Curated quality at scale.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link to="/info/twitter" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </Link>
              <Link to="/info/instagram" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </Link>
              <Link to="/info/facebook" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </Link>
              <Link to="/info/youtube" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-xs mb-8 text-amber-500 uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About ZyLora', path: '/info/about-zylora' },
                { name: 'Agri-Auctions', path: '/agri-auctions' },
                { name: 'Become a Seller', path: '/signup' },
                { name: 'Sustainability', path: '/info/sustainability' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Center */}
          <div>
            <h4 className="font-bold text-xs mb-8 text-amber-500 uppercase tracking-[0.2em]">Help Center</h4>
            <ul className="space-y-4">
              {[
                { name: 'Shipping Policy', path: '/info/shipping-policy' },
                { name: 'Bulk Discounts', path: '/info/bulk-discounts' },
                { name: 'Returns & Refunds', path: '/info/returns-refunds' },
                { name: 'FAQs', path: '/info/faqs' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-xs text-amber-500 uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-gray-400 text-sm font-medium">
              Get updates on new auction lots and seasonal sales.
            </p>
            <form onSubmit={handleSubscribe} className="relative group">
              <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 group-focus-within:border-amber-500/50 transition-all duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 px-3 py-2 text-white placeholder:text-gray-500"
                  required
                />
                <button 
                  type="submit"
                  className="bg-amber-500 text-[#0A1628] px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300"
                >
                  {subscribed ? 'Joined!' : 'Join'}
                </button>
              </div>
              {subscribed && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-amber-500 font-bold mt-2 absolute"
                >
                  Welcome to the ZyLora inner circle!
                </motion.p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            © 2024 ZyLora. Built for the modern professional.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <Link to="/info/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/info/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/info/cookie-settings" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
