import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://zylora-e-commerce.onrender.com';

  const fetchWishlist = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.get(`${BACKEND_URL}/api/wishlist`, config);
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to wishlist');
        return false;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.post(`${BACKEND_URL}/api/wishlist/${productId}`, {}, config);
      if (res.data.success) {
        await fetchWishlist(); // Refresh wishlist
        return true;
      }
    } catch (error) {
      console.error('Wishlist Error Details:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to update wishlist';
      alert(errorMsg);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return false;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.delete(`${BACKEND_URL}/api/wishlist/${productId}`, config);
      if (res.data.success) {
        await fetchWishlist(); // Refresh wishlist
        return true;
      }
    } catch (error) {
      console.error('Wishlist Remove Error:', error.response?.data || error.message);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => {
      const itemId = item._id || item.id;
      return itemId?.toString() === productId.toString();
    });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist, 
      wishlistCount: wishlistItems.length,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
