const Message = require('../models/Message');

// @desc    Get chat history for a product
// @route   GET /api/negotiation/:productId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ productId: req.params.productId })
      .sort('createdAt')
      .populate('sender', 'name');

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
