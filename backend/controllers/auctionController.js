const Auction = require('../models/Auction');
const Product = require('../models/Product');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private/Seller
exports.createAuction = async (req, res) => {
  try {
    const { productId, basePrice, durationHours } = req.body;

    if (!productId || !basePrice || !durationHours) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Ensure the product belongs to the seller
    const product = await Product.findOne({ _id: productId, seller: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const auction = await Auction.create({
      product: productId,
      seller: req.user._id,
      basePrice,
      startTime,
      endTime,
      status: 'ACTIVE' // Automatically start it for now
    });

    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all auctions for the logged in seller
// @route   GET /api/auctions/seller
// @access  Private/Seller
exports.getSellerAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('product', 'name images price stock')
      .populate('highestBidder', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: auctions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all active auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'ACTIVE', endTime: { $gt: new Date() } })
      .populate('product', 'name images price stock category location')
      .populate('seller', 'name')
      .populate('highestBidder', 'name email')
      .populate({
        path: 'bids.user',
        select: 'name email'
      })
      .populate({
        path: 'userPayments.user',
        select: 'name email'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: auctions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Place a bid on an auction
// @route   POST /api/auctions/:id/bid
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status !== 'ACTIVE' || auction.endTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Auction is not active' });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ success: false, message: `Bid must be higher than current bid (₹${auction.currentBid})` });
    }

    // Check if user has a previous bid in this auction
    let userPaymentRecord = auction.userPayments.find(p => p.user.toString() === userId.toString());
    
    let amountToPay = amount; // Amount user needs to pay
    let previousBidAmount = 0;

    if (userPaymentRecord) {
      // User is re-bidding - calculate difference
      previousBidAmount = userPaymentRecord.currentBid;
      amountToPay = amount - previousBidAmount; // Only pay the difference
      
      // Update user's payment record
      userPaymentRecord.totalPaid += amountToPay;
      userPaymentRecord.currentBid = amount;
      userPaymentRecord.isRefunded = false;
    } else {
      // First bid from this user - pay full amount
      userPaymentRecord = {
        user: userId,
        totalPaid: amount,
        currentBid: amount,
        refundAmount: 0,
        isRefunded: false
      };
      auction.userPayments.push(userPaymentRecord);
    }

    // If there's a previous highest bidder, mark them for refund
    if (auction.highestBidder && auction.highestBidder.toString() !== userId.toString()) {
      const previousBidderRecord = auction.userPayments.find(p => 
        p.user.toString() === auction.highestBidder.toString()
      );
      
      if (previousBidderRecord && !previousBidderRecord.isRefunded) {
        previousBidderRecord.refundAmount = previousBidderRecord.totalPaid;
        previousBidderRecord.isRefunded = true;
      }
    }

    // Mark previous bids from this user as inactive
    auction.bids.forEach(bid => {
      if (bid.user.toString() === userId.toString()) {
        bid.isActive = false;
      }
    });

    // Update auction
    auction.currentBid = amount;
    auction.highestBidder = userId;
    auction.bids.push({
      user: userId,
      amount: amount,
      amountPaid: amountToPay,
      isActive: true
    });

    await auction.save();

    // Populate user data before emitting socket event
    await auction.populate({
      path: 'bids.user',
      select: 'name email'
    });
    await auction.populate({
      path: 'userPayments.user',
      select: 'name email'
    });
    await auction.populate('highestBidder', 'name email');

    // Emit socket event for real-time update with populated data
    const io = req.app.get('io');
    if (io) {
      io.to(`auction_${auction._id}`).emit('auction_bid_updated', {
        auctionId: auction._id,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
        newBid: {
          bidAmount: amount,
          amountPaid: amountToPay,
          isRebid: previousBidAmount > 0,
          message: previousBidAmount > 0 
            ? `Bid updated: You paid ₹${amountToPay} additional (₹${previousBidAmount} + ₹${amountToPay} = ₹${amount})`
            : `New bid placed: ₹${amount}`
        },
        bids: auction.bids,
        userPayments: auction.userPayments
      });
    }

    res.status(200).json({
      success: true,
      message: previousBidAmount > 0 
        ? `Bid updated successfully! You paid ₹${amountToPay} additional to increase your bid from ₹${previousBidAmount} to ₹${amount}`
        : `Bid placed successfully! You paid ₹${amount}`,
      data: {
        auction,
        paymentInfo: {
          bidAmount: amount,
          amountPaid: amountToPay,
          isRebid: previousBidAmount > 0,
          previousBidAmount,
          totalAmountPaidInAuction: userPaymentRecord.totalPaid
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user's payment info for an auction
// @route   GET /api/auctions/:id/my-bid
// @access  Private
exports.getUserBidInfo = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    const userPayment = auction.userPayments.find(p => 
      p.user.toString() === req.user._id.toString()
    );

    if (!userPayment) {
      return res.status(200).json({
        success: true,
        data: {
          hasBid: false,
          message: 'You have not placed any bid on this auction'
        }
      });
    }

    const userActiveBid = auction.bids.find(b => 
      b.user.toString() === req.user._id.toString() && b.isActive === true
    );

    res.status(200).json({
      success: true,
      data: {
        hasBid: true,
        currentBid: userPayment.currentBid,
        totalPaid: userPayment.totalPaid,
        refundAmount: userPayment.refundAmount,
        isRefunded: userPayment.isRefunded,
        isHighestBidder: auction.highestBidder.toString() === req.user._id.toString(),
        activeBid: userActiveBid,
        auctionStatus: auction.status,
        auctionEndTime: auction.endTime
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get auction details with payment tracking
// @route   GET /api/auctions/:id/details
// @access  Private
exports.getAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('product', 'name images price')
      .populate('seller', 'name storeName')
      .populate('highestBidder', 'name email');

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    const userPayment = auction.userPayments.find(p => 
      p.user.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        auction,
        userPayment: userPayment || null,
        totalParticipants: new Set(auction.bids.map(b => b.user.toString())).size,
        totalBids: auction.bids.filter(b => b.isActive).length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Process refunds when auction ends
// @route   POST /api/auctions/:id/process-refunds
// @access  Private/Admin or Seller
exports.processRefunds = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to process refunds' });
    }

    if (auction.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Auction must be completed to process refunds' });
    }

    const refundedUsers = [];
    
    for (const payment of auction.userPayments) {
      if (payment.refundAmount > 0 && !payment.isRefunded) {
        // Here you would integrate with payment gateway to process actual refund
        // For now, we're marking it as refunded in the system
        payment.isRefunded = true;
        
        refundedUsers.push({
          userId: payment.user,
          amount: payment.refundAmount,
          status: 'processed'
        });
      }
    }

    await auction.save();

    res.status(200).json({
      success: true,
      message: `Refunds processed for ${refundedUsers.length} users`,
      data: {
        refundedUsers,
        highestBidder: auction.highestBidder,
        finalBidAmount: auction.currentBid
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
