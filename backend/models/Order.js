const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: Number, // Using Number because frontend products.js uses numeric IDs
        required: true
      }
    }
  ],
  shippingAddress: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'UPI'
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: true // Assuming paid for now as per frontend flow
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
