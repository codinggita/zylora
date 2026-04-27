const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  currentBid: {
    type: Number,
    default: function() {
      return this.basePrice;
    }
  },
  highestBidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  bids: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Auction', auctionSchema);
