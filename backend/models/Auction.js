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
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Track user payment history per auction
  userPayments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    currentBid: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundedAt: Date
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
  winnerNotificationSent: {
    type: Boolean,
    default: false
  },
  winnerAddressSubmitted: {
    type: Boolean,
    default: false
  },
  winnerAddress: {
    name: String,
    mobile: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    submittedAt: Date
  },
  winnerOrder: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    default: null
  },
  orderCreatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Auction', auctionSchema);
