const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getSellerOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/seller-orders')
  .get(protect, getSellerOrders);

router.route('/:id')
  .get(protect, getOrderById);

module.exports = router;
