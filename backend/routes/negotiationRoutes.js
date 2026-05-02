const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  getSellerNegotiationSummary,
  getSellerAcceptedNegotiations,
  getBuyerNegotiations,
  updateNegotiationStatus
} = require('../controllers/negotiationController');
const { protect } = require('../middleware/auth');

router.get('/seller/summary', protect, getSellerNegotiationSummary);
router.get('/seller/accepted', protect, getSellerAcceptedNegotiations);
router.get('/buyer/my-negotiations', protect, getBuyerNegotiations);
router.put('/:id/status', protect, updateNegotiationStatus);
router.get('/:productId', protect, getChatHistory);

module.exports = router;
