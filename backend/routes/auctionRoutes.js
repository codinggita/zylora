const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createAuction, 
  getSellerAuctions,
  getAuctions,
  placeBid 
} = require('../controllers/auctionController');

router.get('/', getAuctions);
router.post('/', protect, createAuction);
router.get('/seller', protect, getSellerAuctions);
router.post('/:id/bid', protect, placeBid);

module.exports = router;
