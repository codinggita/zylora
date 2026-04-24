import React, { useState } from 'react';
import { 
  Search, Menu, ShoppingCart, Heart, User, 
  ChevronRight, Trash2, Plus, Minus, ShieldCheck, 
  Truck, RotateCcw, LogOut, Ticket, ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const originalSubtotal = cartItems.reduce((acc, item) => acc + (item.oldPrice * item.quantity), 0);
    const discount = originalSubtotal - subtotal;
    const negotiationSavings = cartItems.filter(i => i.negotiated).reduce((acc, i) => acc + (i.oldPrice - i.price), 0);
    
    return {
      subtotal,
      originalSubtotal,
      discount,
      negotiationSavings,
      total: subtotal
    };
  };

  const stats = calculateTotal();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-24">
      {/* Main Header */}
      <header className="bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">ZyLora</Link>
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Become a Seller</a>
                <a href="#" className="hover:text-white transition-colors">Agri Auctions</a>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative mx-4">
            <input 
              type="text" 
              placeholder="Search auctions..." 
              className="w-full bg-[#111827] border border-gray-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-500" size={18} />
          </div>

          <div className="flex items-center gap-6 text-gray-300">
            <div className="hidden md:flex items-center gap-4">
              <LogOut size={20} className="cursor-pointer hover:text-white" onClick={handleLogout} />
              <User size={20} className="cursor-pointer hover:text-white" onClick={() => navigate('/profile')} />
              <div className="relative cursor-pointer hover:text-white" onClick={() => navigate('/wishlist')}>
                <Heart size={20} className={wishlistCount > 0 ? 'text-red-500 fill-red-500' : ''} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold px-1 rounded-full min-w-[18px] text-center">{wishlistCount}</span>
                )}
              </div>
              <div className="relative cursor-pointer text-amber-500">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">My Cart</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-8">My Cart ({cartItems.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                  <div className="w-full md:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-4 shrink-0">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-400 line-through">₹{item.oldPrice.toLocaleString()}</span>
                        </div>
                        {item.delivery && (
                           <p className="text-xs text-gray-500 flex items-center gap-1.5">
                             <Truck size={14} className="text-gray-400" /> {item.delivery}
                           </p>
                        )}
                        {item.status && (
                           <p className="text-xs text-green-600 font-bold flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div> {item.status}
                           </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Seller: {item.seller?.name || item.seller}</p>
                      </div>
                      
                      {item.negotiated && (
                        <div className="bg-[#E0F2F1] text-[#00897B] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#B2DFDB]">
                          Negotiated: ₹{item.price.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 pt-6 border-t border-gray-50 gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-5 py-1 font-bold text-sm bg-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-6">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                          Save for Later
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-gray-500 mt-2">Add some premium items to get started.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-8 bg-[#0A1628] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors"
                >
                  Shop Now
                </button>
              </div>
            )}

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl border border-dashed border-orange-200 p-6 flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <div className="bg-orange-50 p-3 rounded-xl">
                   <Ticket className="text-orange-500" size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">Apply Coupon</h4>
                   <p className="text-xs text-gray-500">Use ZYLORA10 for 10% off on first agricultural purchase</p>
                 </div>
               </div>
               <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                 <div className="px-4 py-2 text-xs font-black text-orange-600 uppercase tracking-widest border-r border-gray-200">ZYLORA10</div>
                 <button className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-white transition-colors">Apply</button>
               </div>
            </div>
          </div>

          {/* Price Details Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Price Details</h2>
              
              <div className="space-y-4 mb-8 border-b border-gray-50 pb-8">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Price ({cartItems.length} items)</span>
                  <span className="text-gray-900 font-bold">₹{stats.originalSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600 font-bold">-₹{stats.discount.toLocaleString()}</span>
                </div>
                {stats.negotiationSavings > 0 && (
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-teal-600">Negotiation Savings</span>
                    <span className="text-teal-600 font-bold">-₹{stats.negotiationSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Delivery Charges</span>
                  <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                   <p className="text-3xl font-black text-gray-900">₹{stats.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-green-50 text-green-700 p-3 rounded-xl text-[10px] font-bold text-center uppercase tracking-widest mb-6 border border-green-100">
                You will save ₹{(stats.discount + stats.negotiationSavings).toLocaleString()} on this order
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#0A1628] text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-blue-900/10 mb-6 uppercase tracking-widest text-xs"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" />
                100% Safe and Secure Payments
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer matching image */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ZyLora</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Redefining the agricultural marketplace with premium curation and transparent auctions.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-amber-500 cursor-pointer">About Zylora</li>
              <li className="hover:text-amber-500 cursor-pointer">Shipping Policy</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Discounts</li>
              <li className="hover:text-amber-500 cursor-pointer">Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-amber-500 cursor-pointer">Live Auctions</li>
              <li className="hover:text-amber-500 cursor-pointer">Negotiation Hub</li>
              <li className="hover:text-amber-500 cursor-pointer">Seller Portal</li>
              <li className="hover:text-amber-500 cursor-pointer">Verification</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-xs text-gray-500 mb-6">Stay updated on premium auctions.</p>
            <div className="bg-gray-900 p-1 rounded-lg flex border border-gray-800">
              <input type="email" placeholder="Your Email" className="bg-transparent text-xs px-4 py-2 outline-none flex-1" />
              <button className="bg-amber-500 text-white px-4 py-2 rounded-md font-bold text-xs hover:bg-amber-600">JOIN</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <p>© 2024 Zylora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
