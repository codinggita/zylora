import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  const fetchCart = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        // Fallback to local storage for guests
        const savedCart = localStorage.getItem('zylora_cart');
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
        setLoading(false);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.get(`${BACKEND_URL}/api/cart`, config);
      if (res.data.success) {
        const formattedItems = res.data.data.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          oldPrice: item.product.oldPrice || item.product.price * 1.2,
          image: item.product.images ? item.product.images[0] : 'https://placehold.co/300x300/f3f4f6/9ca3af',
          quantity: item.quantity,
          category: item.product.category
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      // If unauthorized, clear token and state
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fallback to local storage on other errors
      const savedCart = localStorage.getItem('zylora_cart');
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync with local storage for guests
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      localStorage.setItem('zylora_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        // Guest mode
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          }
          return [...prevItems, { 
            ...product, 
            quantity,
            price: product.price,
            oldPrice: product.oldPrice || product.price * 1.2,
            image: product.images ? product.images[0] : product.image
          }];
        });
        return;
      }

      const productId = product.id || product._id;

      // Check if product is a static/demo product (non-MongoDB ID)
      const isValidMongoId = /^[a-f\d]{24}$/i.test(String(productId));
      if (!isValidMongoId) {
        alert('This is a demo product and cannot be added to cart. Browse our live products to add items!');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`${BACKEND_URL}/api/cart/${productId}`, { quantity }, config);
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${BACKEND_URL}/api/cart/${id}`, config);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id, delta) => {
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;
      const newQuantity = Math.max(1, item.quantity + delta);

      const token = sessionStorage.getItem('token');
      if (!token) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`${BACKEND_URL}/api/cart/${id}`, { quantity: newQuantity }, config);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${BACKEND_URL}/api/cart`, config);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

