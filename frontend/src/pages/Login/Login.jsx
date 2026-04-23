import React, { useState } from 'react';
import { CheckCircle2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [userType, setUserType] = useState('buyer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B17] text-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold tracking-tight">ZyLora</h1>
          <div className="hidden md:flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Become a Seller</a>
            <a href="#" className="hover:text-white transition-colors">Agri Auctions</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <input 
              type="text" 
              placeholder="Search auctions..." 
              className="bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
            <div className="absolute left-3 top-2.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
             <ArrowRight size={20} className="cursor-pointer hover:text-white" />
             <User size={20} className="cursor-pointer hover:text-white" />
             <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             </div>
             <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-white"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Info */}
        <div className="md:w-[45%] bg-[#050B17] p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 max-w-md">
            <h2 className="text-xl font-semibold mb-8">ZyLora</h2>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Shop Smarter.<br />
              Deal Better.
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              The premium marketplace for curated auctions and professional negotiations.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="text-orange-500 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-white">Real-time Agri Auctions</h3>
                  <p className="text-gray-400 text-sm">Access exclusive high-value agricultural inventories in minutes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="text-orange-500 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-white">Verified Business Sellers</h3>
                  <p className="text-gray-400 text-sm">Every seller is vetted with GSTIN and business credentials.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="text-orange-500 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-white">Direct Negotiation Hub</h3>
                  <p className="text-gray-400 text-sm">Talk directly with sellers to get the best bulk deals.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-900/20 blur-[120px] rounded-full"></div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            {/* Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg flex mb-12">
              <button 
                onClick={() => setUserType('buyer')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'buyer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Individual Buyer
              </button>
              <button 
                onClick={() => setUserType('seller')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'seller' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Business Seller
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="name@company.com" 
                  required
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-semibold text-orange-600 hover:underline">Forgot Password?</a>
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="••••••••" 
                  required
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-500">Remember me for 30 days</label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F172A] text-white py-3 rounded-lg font-semibold hover:bg-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.88-1.1 3.23-2.9 3.74-5.06h-7.48c.5 2.15 1.85 3.96 3.74 5.06zm4.54-11.81l-1.42 1.42a8.03 8.03 0 0 0-6.24 0l-1.42-1.42a8.03 8.03 0 0 1 9.08 0z"/></svg>
                Apple
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              New to Zylora? <Link to="/signup" className="text-orange-600 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050B17] border-t border-gray-800 px-12 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">ZyLora</h2>
            <p className="text-gray-400 text-sm">Professional marketplace and high-end retail auctions for the modern trader.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About ZyLora</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Policy</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bulk Discounts</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Stay Connected</h4>
            <div className="flex gap-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white cursor-pointer"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white cursor-pointer"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white cursor-pointer"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </div>
            <p className="mt-8 text-xs text-gray-600">© 2024 ZyLora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
