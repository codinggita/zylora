import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Check, CreditCard, Landmark, Wallet, 
  ChevronRight, ArrowLeft, MapPin, 
  ShieldCheck, HelpCircle, Trash2
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const negotiatedPrice = location.state?.price;
  const negotiatedProduct = location.state?.product;
  const { cartItems, cartCount, clearCart } = useCart();
  
  // Use negotiated product if available, otherwise use cart items
  const checkoutItems = negotiatedProduct ? [
    {
      id: negotiatedProduct.id || negotiatedProduct._id,
      name: negotiatedProduct.name,
      price: negotiatedPrice || negotiatedProduct.price,
      quantity: 1,
      image: negotiatedProduct.images?.[0] || negotiatedProduct.image || 'https://placehold.co/300x300/f3f4f6/9ca3af'
    }
  ] : cartItems;

  const [step, setStep] = useState(2); 
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    pincode: '',
    address: ''
  });

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setAddresses(res.data.data.addresses || []);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchUserAddresses();
  }, [BACKEND_URL, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingId(addr._id || addr.id);
    setNewAddress({
      name: addr.name,
      mobile: addr.mobile,
      pincode: addr.pincode || '',
      address: addr.address
    });
    
    const formElement = document.getElementById('address-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (addresses.length === 1) {
      alert("You must have at least one delivery address.");
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.delete(`${BACKEND_URL}/api/auth/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to delete address');
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.mobile || !newAddress.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      let res;
      if (editingId) {
        res = await axios.put(`${BACKEND_URL}/api/auth/addresses/${editingId}`, newAddress, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${BACKEND_URL}/api/auth/addresses`, newAddress, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        setAddresses(res.data.data);
        setEditingId(null);
        setNewAddress({ name: '', mobile: '', pincode: '', address: '' });
        alert(editingId ? "Address updated successfully!" : "Address saved!");
      }
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address');
    }
  };

  const selectAddress = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.put(`${BACKEND_URL}/api/auth/addresses/${id}/select`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Error selecting address:', err);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    const selectedAddr = addresses.find(a => a.selected);
    if (!selectedAddr) {
      alert("Please select or add a delivery address");
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      // 1. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 2. Create Razorpay order on backend
      const rzpOrderRes = await axios.post(`${BACKEND_URL}/api/payments/razorpay/order`, {
        amount: stats.total
      }, config);

      if (!rzpOrderRes.data.success) {
        alert("Failed to initiate payment. Please try again.");
        setLoading(false);
        return;
      }

      const rzpOrder = rzpOrderRes.data.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "ZyLora E-Commerce",
        description: "Order Payment",
        image: "https://zylora.com/logo.png",
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            // 4. Verify payment on backend
            const verifyRes = await axios.post(`${BACKEND_URL}/api/payments/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, config);

            if (verifyRes.data.success) {
              // 5. Finalize business order in database
              const orderData = {
                orderItems: checkoutItems.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  image: item.image || (item.images && item.images[0]) || 'https://placehold.co/300x300/f3f4f6/9ca3af',
                  price: item.price,
                  product: item.id || item._id
                })),
                shippingAddress: {
                  name: selectedAddr.name,
                  mobile: selectedAddr.mobile,
                  address: selectedAddr.address
                },
                paymentMethod: 'RAZORPAY',
                paymentInfo: {
                  id: response.razorpay_payment_id,
                  status: 'PAID'
                },
                totalPrice: stats.total
              };

              const finalOrderRes = await axios.post(`${BACKEND_URL}/api/orders`, orderData, config);

              if (finalOrderRes.data.success) {
                if (!negotiatedProduct) {
                  clearCart();
                }
                navigate('/order-success', { 
                  state: { order: finalOrderRes.data.data } 
                });
              }
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error('Error finalizing order:', err);
            alert("Payment successful but order creation failed. Please contact support.");
          }
        },
        prefill: {
          name: selectedAddr.name,
          contact: selectedAddr.mobile
        },
        notes: {
          address: selectedAddr.address
        },
        theme: {
          color: "#0A1628"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return {
      subtotal,
      total: subtotal
    };
  };

  const stats = calculateTotal();

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-24">
      <Header placeholder="Search products..." />

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
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-100">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm font-black text-gray-900 mt-1">?{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8 pt-8 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Price ({checkoutItems.length} items)</span>
                    <span className="text-gray-900 font-black">?{stats.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                    <span className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Discount</span>
                    <span className="text-green-600 font-black">- ?0</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">?{stats.total.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  Place Order & Pay ?{stats.total.toLocaleString()} <ChevronRight size={16} />
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

