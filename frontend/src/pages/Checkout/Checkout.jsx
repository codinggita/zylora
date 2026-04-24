import React, { useState } from 'react';
import axios from 'axios';
import { 
  Check, CreditCard, Landmark, Wallet, 
  ChevronRight, ArrowLeft, MapPin, 
  ShieldCheck, HelpCircle, LogOut, User, Heart, ShoppingCart, Search, Trash2
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const negotiatedPrice = location.state?.price;
  const { cartItems, cartCount, clearCart } = useCart();
  const [step, setStep] = useState(2); 
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Address State
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      type: "Home",
      address: "Flat 402, Skyline Residency, Bandra West, Near Lilavati Hospital, Mumbai, Maharashtra 400050",
      mobile: "+91 98765 43210",
      selected: true
    }
  ]);

  const [editingId, setEditingId] = useState(null);

  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    pincode: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleEditAddress = (addr, e) => {
    e.stopPropagation(); // Prevent card selection
    setEditingId(addr.id);
    
    // Parse the address to try and extract PIN if it was added via our "Save" logic
    let mainAddr = addr.address;
    let pin = '';
    if (mainAddr.includes(', PIN: ')) {
      const parts = mainAddr.split(', PIN: ');
      mainAddr = parts[0];
      pin = parts[1];
    }

    setNewAddress({
      name: addr.name,
      mobile: addr.mobile,
      pincode: pin,
      address: mainAddr
    });
    
    // Scroll to form
    const formElement = document.getElementById('address-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation(); // Prevent card selection
    if (addresses.length === 1) {
      alert("You must have at least one delivery address.");
      return;
    }
    setAddresses(prev => {
      const filtered = prev.filter(addr => addr.id !== id);
      // If deleted address was selected, select the first remaining one
      if (prev.find(a => a.id === id)?.selected) {
        filtered[0].selected = true;
      }
      return filtered;
    });
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.mobile || !newAddress.address) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingId) {
      // Update existing
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId 
          ? { 
              ...addr, 
              name: newAddress.name, 
              mobile: newAddress.mobile, 
              address: `${newAddress.address}${newAddress.pincode ? `, PIN: ${newAddress.pincode}` : ''}`
            } 
          : addr
      ));
      setEditingId(null);
      alert("Address updated successfully!");
    } else {
      // Add new
      const addedAddress = {
        id: Date.now(),
        name: newAddress.name,
        type: "New",
        address: `${newAddress.address}${newAddress.pincode ? `, PIN: ${newAddress.pincode}` : ''}`,
        mobile: newAddress.mobile,
        selected: true
      };

      setAddresses(prev => [addedAddress, ...prev.map(a => ({ ...a, selected: false }))]);
      alert("Address saved and selected!");
    }
    
    // Reset form
    setNewAddress({ name: '', mobile: '', pincode: '', address: '' });
  };

  const selectAddress = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      selected: addr.id === id
    })));
  };

  const handlePlaceOrder = async () => {
    const selectedAddr = addresses.find(a => a.selected);
    if (!selectedAddr) {
      alert("Please select or add a delivery address");
      return;
    }

    try {
      const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-3.onrender.com';

      const token = localStorage.getItem('token');
      
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/150',
          price: item.price,
          product: item.id
        })),
        shippingAddress: {
          name: selectedAddr.name,
          mobile: selectedAddr.mobile,
          address: selectedAddr.address
        },
        paymentMethod: paymentMethod.toUpperCase(),
        totalPrice: stats.total
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderData, config);

      if (response.data.success) {
        clearCart();
        navigate('/order-success', { 
          state: { 
            order: response.data.data 
          } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  const calculateTotal = () => {
    const subtotal = negotiatedPrice || cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return {
      subtotal,
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
      {/* Header */}
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
              <User size={20} className="cursor-pointer hover:text-white" />
              <Heart size={20} className="cursor-pointer hover:text-white" />
              <div className="relative cursor-pointer hover:text-white" onClick={() => navigate('/cart')}>
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] text-white font-bold px-1 rounded-full">{cartCount}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {/* Progress Tracker */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-md relative">
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-2">
                <Check size={16} />
              </div>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 -mt-6"></div>
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 font-bold text-xs">
                2
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Delivery</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 -mt-6"></div>
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-2 font-bold text-xs">
                3
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Address & Payment */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Deliver To</h2>
              </div>

              {/* Address Cards */}
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => selectAddress(addr.id)}
                    className={`border-2 rounded-xl p-6 relative cursor-pointer transition-all ${addr.selected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                  >
                    {addr.selected && (
                      <div className="absolute top-4 right-4 text-blue-600">
                        <Check size={20} className="bg-blue-600 text-white rounded-full p-0.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-black text-gray-900">{addr.name}</span>
                      <span className="bg-gray-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{addr.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                      {addr.address}<br />
                      <span className="font-bold text-gray-900">{addr.mobile}</span>
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={(e) => handleEditAddress(addr, e)}
                        className="border border-gray-200 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Edit Address
                      </button>
                      <button 
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="border border-red-100 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Address Form */}
              <div id="address-form" className="mt-8 pt-8 border-t border-gray-50 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                    {editingId ? 'Edit Delivery Address' : 'Add New Address'}
                  </h3>
                  {editingId && (
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setNewAddress({ name: '', mobile: '', pincode: '', address: '' });
                      }}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={newAddress.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Prashant Parmar"
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                    <input 
                      type="text" 
                      name="mobile"
                      value={newAddress.mobile}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">PIN Code</label>
                    <input 
                      type="text" 
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Address (House No, Building, Street, Area)</label>
                    <textarea 
                      name="address"
                      value={newAddress.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Flat 101, Blue Skies Bldg, Linking Road"
                      rows="3" 
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                    ></textarea>
                  </div>
                </div>
                <button 
                  onClick={handleSaveAddress}
                  className="mt-6 bg-[#0A1628] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
                >
                  {editingId ? 'Update Address' : 'Save and Deliver Here'}
                </button>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Payment</h2>
              
              {/* Payment Tabs */}
              <div className="flex border-b border-gray-100 mb-8">
                {[
                  { id: 'upi', label: 'UPI', icon: Wallet },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                  { id: 'emi', label: 'EMI', icon: CreditCard }
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-2 px-8 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${paymentMethod === method.id ? 'border-orange-500 text-orange-600 bg-orange-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    <method.icon size={16} />
                    {method.label}
                  </button>
                ))}
              </div>

              {/* UPI Tab Content */}
              {paymentMethod === 'upi' && (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Enter UPI ID</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="username@upi" className="flex-1 border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" />
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors">Verify</button>
                    </div>
                    <div className="mt-6 bg-blue-50 p-4 rounded-xl flex gap-3 items-center">
                      <div className="bg-white p-1.5 rounded-full text-blue-600">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-[10px] text-blue-800 leading-tight">Your transaction is secured with end-to-end encryption.</p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48 aspect-square border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 bg-gray-50/50">
                    <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-sm mb-2">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ZyLoraPayment" alt="QR Code" className="w-full h-full grayscale opacity-30" />
                    </div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center">Scan to Pay using Any UPI App</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm sticky top-24">
              <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-100">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm font-black text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8 pt-8 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Price ({cartItems.length} items)</span>
                    <span className="text-gray-900 font-black">₹{stats.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                    <span className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Discount</span>
                    <span className="text-green-600 font-black">- ₹0</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₹{stats.total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  Place Order & Pay ₹{stats.total.toLocaleString()} <ChevronRight size={16} />
                </button>
                
                <p className="text-[8px] text-gray-400 font-bold text-center mt-4 uppercase tracking-widest">
                  Secure Transaction • 7-Day Returns • Buyer Protection
                </p>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white shrink-0">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Need Help?</h4>
                <p className="text-[10px] text-gray-400 font-medium">Chat with a ZyLora expert 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">ZyLora</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Connecting global enterprise with agricultural innovation through a premium curated marketplace experience.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Quick Links</h4>
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
              <li className="hover:text-amber-500 cursor-pointer">Agri Technology</li>
              <li className="hover:text-amber-500 cursor-pointer">Bulk Fertilizers</li>
              <li className="hover:text-amber-500 cursor-pointer">Smart Sensors</li>
              <li className="hover:text-amber-500 cursor-pointer">Logistics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest">Newsletter</h4>
            <p className="text-[10px] text-gray-500 mb-6 font-medium uppercase tracking-widest">Stay updated on agricultural auctions and market trends.</p>
            <div className="bg-gray-900 p-1 rounded-lg flex border border-gray-800">
              <input type="email" placeholder="Email Address" className="bg-transparent text-xs px-4 py-2 outline-none flex-1" />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md font-black text-[10px] hover:bg-orange-600 transition-colors">JOIN</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:row justify-between items-center gap-4 text-[8px] text-gray-500 font-black uppercase tracking-widest">
          <p>© 2024 ZYLORA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
