const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getSellerOrders, getOrderById, requestReturn, updateReturnStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/seller-orders')
  .get(protect, getSellerOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/return')
  .put(protect, requestReturn);

router.route('/:id/return-status')
  .put(protect, updateReturnStatus);

module.exports = router;
