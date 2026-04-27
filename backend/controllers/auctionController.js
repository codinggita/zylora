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

    // Update auction
    auction.currentBid = amount;
    auction.highestBidder = req.user._id;
    auction.bids.push({
      user: req.user._id,
      amount: amount
    });

    await auction.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`auction_${auction._id}`).emit('auction_bid_updated', {
        auctionId: auction._id,
        currentBid: auction.currentBid,
        highestBidder: req.user._id,
        bids: auction.bids
      });
    }

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
