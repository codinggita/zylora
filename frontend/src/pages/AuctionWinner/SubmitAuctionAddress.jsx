import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Phone, FileText, CheckCircle, AlertCircle, 
  Loader, ArrowRight, ShieldCheck, Truck, ShoppingBag,
  CreditCard, ChevronRight
} from 'lucide-react';
import Header from '../../components/Header';

const SubmitAuctionAddress = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderFinalizing, setOrderFinalizing] = useState(false);
  const [winnerStatus, setWinnerStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://zylora-e-commerce.onrender.com';

  useEffect(() => {
    fetchWinnerStatus();
  }, [auctionId]);

  const fetchWinnerStatus = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(
        `${BACKEND_URL}/api/auctions/${auctionId}/winner-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setWinnerStatus(res.data.data);
        if (res.data.data.address) {
          setFormData({
            name: res.data.data.address.name || '',
            mobile: res.data.data.address.mobile || '',
            address: res.data.data.address.address || '',
            city: res.data.data.address.city || '',
            state: res.data.data.address.state || '',
            postalCode: res.data.data.address.postalCode || ''
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch auction status');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      // 1. Submit Address
      const addrRes = await axios.post(
        `${BACKEND_URL}/api/auctions/${auctionId}/submit-address`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (addrRes.data.success) {
        setOrderFinalizing(true);
        // 2. Automatically Create Order
        const orderRes = await axios.post(
          `${BACKEND_URL}/api/auctions/${auctionId}/create-order`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (orderRes.data.success) {
          setSuccess('Address verified. Order created successfully!');
          setTimeout(() => {
            navigate(`/auction/${auctionId}/confirm-order`);
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed. Please try again.');
      setOrderFinalizing(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Verifying Winner Status...</p>
        </div>
      </div>
    );
  }

  if (!winnerStatus?.isWinner) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-lg p-12 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">
            You are not the winner of this auction. Only the winner can access the checkout.
          </p>
          <button
            onClick={() => navigate('/agri-auctions')}
            className="w-full bg-[#0A1628] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  if (!winnerStatus?.auctionEnded) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-lg p-12 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Wait a Moment</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">
            This auction is still active. Checkout will be available once the timer expires.
          </p>
          <button
            onClick={() => navigate('/agri-auctions')}
            className="w-full bg-[#0A1628] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
          >
            Monitor Auction
          </button>
        </div>
      </div>
    );
  }

  if (winnerStatus?.orderCreated) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-lg p-12 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Order Settled</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">
            Your order for {winnerStatus?.product?.name} has already been created and is being processed.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all"
          >
            View Order Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Header */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-black">1</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Address</span>
          </div>
          <div className="w-12 h-[2px] bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-black">2</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Checkout</h1>
              <p className="text-gray-500 text-sm font-medium mb-8">Enter your delivery details to finalize your auction win.</p>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={18} />
                  <p className="text-[11px] font-bold uppercase tracking-wide">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600">
                  <CheckCircle size={18} />
                  <p className="text-[11px] font-bold uppercase tracking-wide">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    required
                    rows="3"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="XXXXXX"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100 flex items-start gap-4 mt-8">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-100 shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-green-900 mb-1">Payment Already Settled</h4>
                    <p className="text-[10px] text-green-700 font-medium leading-relaxed">
                      Your winning bid of &#8377;{winnerStatus?.winningBid?.toLocaleString()} was processed during the auction. No additional payment is required for this product.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || orderFinalizing}
                  className="w-full bg-[#0A1628] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 mt-8 flex items-center justify-center gap-3"
                >
                  {submitting || orderFinalizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {orderFinalizing ? 'Finalizing Your Order...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      Place Order <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-serif font-black text-gray-900 mb-6">Winning Harvest</h3>
              
              <div className="flex gap-4 mb-8">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                  <img 
                    src={winnerStatus?.product?.images?.[0] || 'https://placehold.co/300x300/f3f4f6/9ca3af'} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-gray-900 text-sm">{winnerStatus?.product?.name}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Lot ID: {auctionId.slice(-8)}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Winning Bid</span>
                  <span className="text-gray-900">&#8377;{winnerStatus?.winningBid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Mandi Tax & Service</span>
                  <span className="text-green-600 font-black">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span className="text-gray-900">&#8377;0.00</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">Total Settled</span>
                  <span className="text-2xl font-black text-green-600">&#8377;{winnerStatus?.winningBid?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0A1628] rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-green-400" />
                <h4 className="text-xs font-black uppercase tracking-widest">ZyLora Verified Win</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                This transaction is protected by ZyLora's escrow system. Your order will be shipped within 48 hours of address submission.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Truck size={18} className="text-green-400" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em]">Priority Shipping Enabled</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitAuctionAddress;

