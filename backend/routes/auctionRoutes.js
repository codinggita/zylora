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
  processRefunds,
  submitWinnerAddress,
  createAuctionOrder,
  getWinnerStatus
} = require('../controllers/auctionController');

router.get('/', getAuctions);
router.post('/', protect, createAuction);
router.get('/seller', protect, getSellerAuctions);
router.post('/:id/bid', protect, placeBid);
router.get('/:id/my-bid', protect, getUserBidInfo);
router.get('/:id/details', protect, getAuctionDetails);
router.post('/:id/process-refunds', protect, processRefunds);
router.post('/:id/submit-address', protect, submitWinnerAddress);
router.post('/:id/create-order', protect, createAuctionOrder);
router.get('/:id/winner-status', protect, getWinnerStatus);

module.exports = router;
