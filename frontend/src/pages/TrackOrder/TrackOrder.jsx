import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, MapPin, Truck, CheckCircle, Clock, 
  Phone, AlertTriangle, ChevronRight, LogOut
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-3.onrender.com';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setOrder(res.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up polling to check for status updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000);

    return () => clearInterval(interval);
  }, [id, navigate, BACKEND_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the tracking details for this order.</p>
        <button onClick={() => navigate('/profile')} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
          Back to Profile
        </button>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const steps = [
    { 
      id: 1, 
      title: 'Order Placed', 
      desc: `Confirmed on ${orderDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
      status: 'completed',
      icon: CheckCircle
    },
    { 
      id: 2, 
      title: 'Payment Confirmed', 
      desc: `Transaction ID: #TXN-${order._id.substring(order._id.length - 8).toUpperCase()} • ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
      status: 'completed',
      icon: CheckCircle
    },
    { 
      id: 3, 
      title: 'Packed', 
      desc: `Securely packaged at Central Warehouse • ${addDays(orderDate, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 
      status: order.status === 'Processing' ? 'current' : 'completed',
      icon: Package
    },
    { 
      id: 4, 
      title: 'Shipped', 
      desc: `In transit via DTDC Air Express • ${addDays(orderDate, 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 
      status: order.status === 'Shipped' ? 'current' : order.status === 'Delivered' ? 'completed' : 'pending',
      icon: Truck,
      trackingId: `8841${order._id.substring(order._id.length - 7)}`
    },
    { 
      id: 5, 
      title: 'Out for Delivery', 
      desc: `Expected by ${addDays(orderDate, 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} morning`, 
      status: order.status === 'Delivered' ? 'completed' : 'pending',
      icon: Clock
    },
    { 
      id: 6, 
      title: 'Delivered', 
      desc: `Handed over to customer • ${addDays(orderDate, 4).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`, 
      status: order.status === 'Delivered' ? 'completed' : 'pending',
      icon: CheckCircle
    }
  ];

  const estimatedArrival = addDays(orderDate, 4).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const isToday = (date) => new Date().toDateString() === date.toDateString();
  const arrivalLabel = isToday(addDays(orderDate, 4)) ? 'Today' : 
                       isToday(addDays(orderDate, 3)) ? 'Tomorrow' : 
                       estimatedArrival;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans pb-20">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
          <Link to="/profile" className="hover:text-gray-900 transition-colors">My Account</Link>
          <ChevronRight size={10} />
          <Link to="/profile" className="hover:text-gray-900 transition-colors">My Orders</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">Track Order</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tracking Order <span className="text-gray-400">#ZYL-2025-{order._id.substring(order._id.length - 5).toUpperCase()}</span>
        </h1>

        {/* Transit Banner */}
        <div className="bg-blue-600 rounded-xl p-6 mb-12 flex items-center justify-between text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">Your order is in transit...</h3>
              <p className="text-xs text-blue-100 font-medium">Current location: Bangalore Distribution Hub</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Estimated Arrival</p>
            <p className="text-xl font-black">{arrivalLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-6 mb-8 last:mb-0">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-3 border border-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Premium</p>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">{item.name}</h4>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-medium">Batch: #AG-992 • 5KG Sack</p>
                      {order.isNegotiated && (
                        <span className="inline-block bg-[#10B981] text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">
                          Negotiated Price
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-8 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Delivery Address</p>
                <h4 className="text-xs font-bold text-gray-900 mb-2">{order.shippingAddress.name || 'Customer'}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {order.shippingAddress.address}
                </p>
                {order.shippingAddress.mobile && (
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                    Contact: {order.shippingAddress.mobile}
                  </p>
                )}
              </div>

              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Courier Partner</p>
                  <img src="https://via.placeholder.com/60x20?text=DTDC" alt="DTDC" className="grayscale opacity-50" />
                </div>
                <p className="text-xs font-bold text-gray-900">DTDC Express</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  <Phone size={14} /> Call Agent
                </button>
                <button className="flex items-center justify-center gap-2 border border-gray-200 text-gray-900 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  <AlertTriangle size={14} /> Raise Issue
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Progress */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-12">Live Progress</h2>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
                
                <div className="space-y-12">
                  {steps.map((step) => (
                    <div key={step.id} className="relative flex gap-8">
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'current' ? 'bg-blue-600 ring-4 ring-blue-100' :
                        'bg-white border-2 border-gray-200 text-gray-300'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle size={14} /> : 
                         step.status === 'current' ? <div className="w-2 h-2 bg-white rounded-full" /> : 
                         null}
                      </div>
                      
                      <div className="flex-1 -mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-bold ${
                            step.status === 'pending' ? 'text-gray-300' : 
                            step.status === 'current' ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h4>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          step.status === 'pending' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {step.desc}
                        </p>
                        
                        {step.trackingId && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-3 inline-flex items-center gap-4 border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking ID:</span>
                            <span className="text-xs font-mono font-bold text-gray-700">{step.trackingId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white mt-24 py-20 border-t border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">ZyLora</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
              Global agricultural marketplace and auction house, bridging the gap between producers and retailers with precision and trust.
            </p>
          </div>
          
          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Company</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li>About Zylora</li>
              <li>Shipping Policy</li>
              <li>Bulk Discounts</li>
              <li>Help Center</li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Categories</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li>Raw Commodities</li>
              <li>Processed Goods</li>
              <li>Machinery Auctions</li>
              <li>Farm Equipment</li>
            </ul>
          </div>

          <div>
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Stay Connected</h3>
            <div className="flex gap-4 mb-6 grayscale opacity-50">
              <LogOut size={18} />
              <LogOut size={18} />
              <LogOut size={18} />
            </div>
            <p className="text-gray-500 text-[10px] font-medium">© 2024 Zylora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackOrder;
