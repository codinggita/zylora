import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import Cart from './pages/Cart/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Protected Route for Homepage */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/product/:id" 
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/category/:categoryName" 
            element={
              <ProtectedRoute>
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
          
          {/* Catch-all route redirects to home (which will redirect to login if not authenticated) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
