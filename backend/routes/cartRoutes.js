const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/:productId')
  .post(addToCart)
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
