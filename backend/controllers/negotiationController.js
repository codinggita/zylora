const Message = require('../models/Message');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');

// @desc    Get chat history for a product
// @route   GET /api/negotiation/:productId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { buyerId } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    let queryBuyerId = req.user.role === 'buyer' ? req.user._id : buyerId;

    let negotiation = null;
    if (queryBuyerId) {
      negotiation = await Negotiation.findOne({
        productId,
        buyer: queryBuyerId
      });
    } else if (req.user.role === 'seller') {
      // Fallback if seller opens without buyerId (get most recent)
      negotiation = await Negotiation.findOne({
        productId,
        seller: req.user._id
      }).sort('-updatedAt');
      if (negotiation) {
        queryBuyerId = negotiation.buyer;
      }
    }

    let messageQuery = { productId };
    // To ensure we only get messages between this specific buyer and seller
    if (queryBuyerId) {
      messageQuery.sender = { $in: [queryBuyerId, product.seller] };
    }

    const messages = await Message.find(messageQuery)
      .sort('createdAt')
      .populate('sender', 'name');

    res.status(200).json({
      success: true,
      data: messages,
      negotiation: negotiation || null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get seller negotiation summary across seller products
// @route   GET /api/negotiation/seller/summary
// @access  Private/Seller
exports.getSellerNegotiationSummary = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Only sellers can view negotiation summaries'
      });
    }

    const sellerProducts = await Product.find({ seller: req.user._id })
      .select('_id name images price');

    const sellerProductIds = sellerProducts.map((product) => product._id);

    if (sellerProductIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          openNegotiations: 0,
          newRequests: 0,
          conversations: []
        }
      });
    }

    const productMap = new Map(
      sellerProducts.map((product) => [
        product._id.toString(),
        {
          id: product._id.toString(),
          name: product.name,
          image: product.images?.[0] || 'https://via.placeholder.com/150',
          price: product.price
        }
      ])
    );

    const messages = await Message.find({ productId: { $in: sellerProductIds } })
      .sort('-createdAt')
      .populate('sender', 'name role');

    const conversationMap = new Map();

    messages.forEach((message) => {
      const senderId = message.sender?._id?.toString?.() || message.sender?.toString?.();
      const productId = message.productId.toString();
      const conversationKey = `${productId}:${senderId}`;

      if (message.sender?.role === 'seller' || conversationMap.has(conversationKey)) {
        return;
      }

      conversationMap.set(conversationKey, {
        id: conversationKey,
        buyerName: message.sender?.name || 'Buyer',
        buyerInitial: (message.sender?.name || 'B').slice(0, 2).toUpperCase(),
        product: productMap.get(productId),
        lastMessage: message.text,
        offerPrice: message.offerPrice || null,
        messageType: message.type,
        createdAt: message.createdAt
      });
    });

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get real negotiation records for these conversations
    const negotiationRecords = await Negotiation.find({
      productId: { $in: sellerProductIds },
      seller: req.user._id
    });

    const recordMap = new Map(
      negotiationRecords.map(nr => [`${nr.productId}:${nr.buyer}`, nr])
    );

    const enrichedConversations = conversations.map(conv => {
      const record = recordMap.get(conv.id);
      return {
        ...conv,
        negotiationId: record?._id || null,
        status: record?.status || 'PENDING'
      };
    });

    // Remove declined negotiations from the dashboard view
    const visibleConversations = enrichedConversations.filter(conv => conv.status !== 'DECLINED');

    const newRequests = visibleConversations.filter((conversation) => {
      const ageMs = new Date() - new Date(conversation.createdAt);
      return ageMs <= 24 * 60 * 60 * 1000;
    }).length;

    res.status(200).json({
      success: true,
      data: {
        openNegotiations: visibleConversations.length,
        newRequests,
        conversations: visibleConversations.slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update negotiation status (Accept/Decline)
// @route   PUT /api/negotiation/:id/status
// @access  Private
exports.updateNegotiationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    let negotiation = await Negotiation.findById(id);
    
    if (!negotiation) {
      // If no negotiation record exists yet (just messages), we might need to create one
      // But for simplicity, we'll assume the first message created it (or we create it now)
      return res.status(404).json({ success: false, error: 'Negotiation record not found' });
    }

    // Verify ownership
    if (negotiation.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this negotiation' });
    }

    negotiation.status = status;
    await negotiation.save();

    res.status(200).json({
      success: true,
      data: negotiation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get seller accepted negotiations
// @route   GET /api/negotiation/seller/accepted
// @access  Private/Seller
exports.getSellerAcceptedNegotiations = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Only sellers can view accepted negotiations'
      });
    }

    const negotiations = await Negotiation.find({
      seller: req.user._id,
      status: 'AGREED'
    })
      .populate('buyer', 'name email phone')
      .populate('productId', 'name description images price')
      .sort('-updatedAt');

    const data = negotiations
      .filter((item) => item.productId && item.buyer)
      .map((item) => ({
        _id: item._id,
        status: item.status,
        agreedPrice: item.agreedPrice,
        lastOfferPrice: item.lastOfferPrice,
        updatedAt: item.updatedAt,
        buyer: {
          id: item.buyer._id,
          name: item.buyer.name,
          email: item.buyer.email || '',
          phone: item.buyer.phone || ''
        },
        product: {
          id: item.productId._id,
          name: item.productId.name,
          description: item.productId.description,
          image: item.productId.images?.[0] || 'https://via.placeholder.com/150',
          price: item.productId.price
        }
      }));

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
