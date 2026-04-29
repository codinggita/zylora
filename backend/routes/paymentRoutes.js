const express = require('express');
const router = express.Router();
const { 
  createRazorpayOrder, 
  verifyRazorpayPayment 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); // Assuming protect middleware exists

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
