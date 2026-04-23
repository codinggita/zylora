import React from 'react';
import { 
  Check, ArrowRight, Package, ShoppingBag, 
  MapPin, CreditCard, Search, User, Heart, ShoppingCart, LogOut
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { products } from '../../data/products';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, items } = location.state || {};

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Package size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No order found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-[#0A1628] text-white px-6 py-2 rounded-lg font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Recommendations logic (simple slice for now)
  const recommendations = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                <a href="#" className="hover:text-white transition-colors text-[10px]">Become a Seller</a>
                <a href="#" className="hover:text-white transition-colors text-[10px]">Agri Auctions</a>
            </div>
          </div>
          <div className="flex-1 max-w-xl relative mx-4">
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-1.5 px-10 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={14} />
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="hidden md:flex items-center gap-4">
              <LogOut size={18} className="cursor-pointer hover:text-white" onClick={handleLogout} />
              <User size={18} className="cursor-pointer hover:text-white" />
              <Heart size={18} className="cursor-pointer hover:text-white" />
              <div className="relative cursor-pointer hover:text-white">
                <ShoppingCart size={18} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[8px] text-white font-bold px-1 rounded-full">0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-12 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
            <Check size={24} strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-2">Order Placed Successfully! 🎉</h1>
        <p className="text-gray-500 text-sm mb-8 font-medium">
          Thank you, {order.shippingAddress.name}! Your order is being processed and will be delivered by <span className="font-bold text-gray-900">25 April</span>.
        </p>

        {/* Order ID Badge */}
        <div className="inline-block bg-[#0A1628] text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase mb-12">
          Order ID: <span className="text-amber-500">{order._id.substring(0, 12).toUpperCase()}</span>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left mb-12">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Order Summary</h3>
          </div>
          <div className="p-6 space-y-4">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.name} x {item.quantity}</span>
                <span className="font-bold">₹{item.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Shipping Fee</span>
              <span className="font-bold text-green-600 uppercase tracking-tighter">FREE</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</span>
              <span className="text-xl font-black text-amber-500">₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50/50 border-t border-gray-100">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Delivery Address</h4>
              <div className="text-xs space-y-1">
                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                <p className="text-gray-500 leading-relaxed">{order.shippingAddress.address}</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Payment Method</h4>
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                  <CreditCard size={14} className="text-blue-600" />
                </div>
                <span className="font-bold text-gray-900">{order.paymentMethod} (rahul.pay@upi)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-24">
          <button 
            onClick={() => navigate('/my-orders')}
            className="bg-[#0A1628] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            <Package size={16} /> Track My Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-white text-gray-900 border border-gray-200 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </button>
        </div>

        {/* Recommendations Section */}
        <div className="text-left">
          <h2 className="text-xl font-serif font-black mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((prod) => (
              <div 
                key={prod.id} 
                className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/product/${prod.id}`)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#0A1628] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Agri-Spec</span>
                  </div>
                </div>
                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{prod.category}</h4>
                <h3 className="text-xs font-bold text-gray-900 mb-2 truncate">{prod.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs">₹{prod.price.toLocaleString()}</span>
                  <div className="p-1.5 bg-gray-50 rounded-md group-hover:bg-[#0A1628] group-hover:text-white transition-colors">
                    <ShoppingCart size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">ZyLora</h2>
            <p className="text-gray-400 text-[10px] leading-relaxed max-w-xs font-medium">
              Pioneering the future of agricultural commerce. Professional curation for global trade.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">About Zylora</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Categories</h4>
            <ul className="space-y-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <li className="hover:text-amber-500 cursor-pointer">Live Auctions</li>
              <li className="hover:text-amber-500 cursor-pointer">Crop Sensors</li>
              <li className="hover:text-amber-500 cursor-pointer">Organic Fertilizers</li>
              <li className="hover:text-amber-500 cursor-pointer">Smart Tools</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Newsletter</h4>
            <p className="text-[10px] text-gray-500 mb-6 font-medium uppercase tracking-widest">Stay updated with latest market rates.</p>
            <div className="bg-gray-900 p-1 rounded-lg flex border border-gray-800">
              <input type="email" placeholder="Your Email" className="bg-transparent text-[10px] px-4 py-2 outline-none flex-1" />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md font-black text-[10px] hover:bg-orange-600 transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-between items-center text-[8px] text-gray-500 font-black uppercase tracking-widest">
          <p>© 2024 ZYLORA. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default OrderSuccess;
