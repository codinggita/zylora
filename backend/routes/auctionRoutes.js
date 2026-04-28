const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createAuction, 
  getSellerAuctions,
  getAuctions,
  placeBid,
  getUserBidInfo,
  getAuctionDetails,
  processRefunds
} = require('../controllers/auctionController');

router.get('/', getAuctions);
router.post('/', protect, createAuction);
router.get('/seller', protect, getSellerAuctions);
router.post('/:id/bid', protect, placeBid);
router.get('/:id/my-bid', protect, getUserBidInfo);
router.get('/:id/details', protect, getAuctionDetails);
router.post('/:id/process-refunds', protect, processRefunds);

module.exports = router;
