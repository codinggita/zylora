const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'COUNTERED', 'OFFER_SENT', 'AGREED', 'DECLINED'],
    default: 'PENDING'
  },
  agreedPrice: {
    type: Number,
    default: 0
  },
  lastOfferPrice: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastBuzzAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

negotiationSchema.index({ productId: 1, buyer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('Negotiation', negotiationSchema);
