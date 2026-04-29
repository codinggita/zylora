import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import SearchPage from './pages/Search/SearchPage';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Negotiation from './pages/Negotiation/Negotiation';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import Profile from './pages/Profile/Profile';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import Wishlist from './pages/Wishlist/Wishlist';
import AgriAuctions from './pages/AgriAuctions/AgriAuctions';
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';
import SellerNegotiations from './pages/SellerNegotiations/SellerNegotiations';
import SellerOrders from './pages/SellerOrders/SellerOrders';
import SellerAuctions from './pages/SellerAuctions/SellerAuctions';
import SubmitAuctionAddress from './pages/AuctionWinner/SubmitAuctionAddress';
import AuctionOrderConfirmation from './pages/AuctionWinner/AuctionOrderConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <Routes>
          {/* Buyer-only: Home feed redirects sellers to seller dashboard */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute buyerOnly>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute buyerOnly>
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Accessible by both buyers and sellers */}
          <Route 
            path="/product/:id" 
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/negotiate/:id" 
            element={
              <ProtectedRoute>
                <Negotiation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/category/:categoryName" 
            element={
              <ProtectedRoute buyerOnly>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-success" 
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } 
        />
        {/* Profile accessible to both roles */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/track-order/:id" 
          element={
            <ProtectedRoute>
              <TrackOrder />
            </ProtectedRoute>
          } 
        />
        {/* Agri auctions accessible to both roles */}
        <Route 
          path="/agri-auctions" 
          element={
            <ProtectedRoute>
              <AgriAuctions />
            </ProtectedRoute>
          } 
        />
        {/* Auction Winner Routes */}
        <Route 
          path="/auction/:auctionId/submit-address" 
          element={
            <ProtectedRoute>
              <SubmitAuctionAddress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auction/:auctionId/confirm-order" 
          element={
            <ProtectedRoute>
              <AuctionOrderConfirmation />
            </ProtectedRoute>
          } 
        />
        <Route 
            path="/seller-dashboard" 
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller-earnings" 
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard initialTab="Earnings" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller-negotiations" 
            element={
              <ProtectedRoute role="seller">
                <SellerNegotiations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller-orders" 
            element={
              <ProtectedRoute role="seller">
                <SellerOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller-auctions" 
            element={
              <ProtectedRoute role="seller">
                <SellerAuctions />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route redirects to home (which will redirect to login if not authenticated) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </Router>
    </CartProvider>
    </WishlistProvider>
  );
}

export default App;
