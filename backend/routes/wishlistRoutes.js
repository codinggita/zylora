const express = require('express');
const { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist 
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist);

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

module.exports = router;
