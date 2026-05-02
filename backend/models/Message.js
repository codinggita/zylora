const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'offer', 'system'],
    default: 'text'
  },
  offerPrice: {
    type: Number
  },
  quantity: {
    type: Number
  },
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
