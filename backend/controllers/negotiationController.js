const Message = require('../models/Message');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');
const User = require('../models/User');

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
      }).populate('buyer', 'name').populate('seller', 'name');
    } else if (req.user.role === 'seller') {
      // Fallback if seller opens without buyerId (get most recent)
      negotiation = await Negotiation.findOne({
        productId,
        seller: req.user._id
      }).sort('-updatedAt').populate('buyer', 'name').populate('seller', 'name');
      if (negotiation) {
        queryBuyerId = negotiation.buyer;
      }
    }

    let messageQuery = { productId };
    // To ensure we only get messages for this specific negotiation
    if (queryBuyerId) {
      messageQuery.buyerId = queryBuyerId;
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

// @desc    Get buyer negotiations
// @route   GET /api/negotiation/buyer/my-negotiations
// @access  Private/Buyer
exports.getBuyerNegotiations = async (req, res) => {
  try {
    const negotiations = await Negotiation.find({
      buyer: req.user._id
    })
      .populate('seller', 'name storeName email phone')
      .populate('productId', 'name description images price')
      .sort('-updatedAt');

    const data = negotiations
      .filter((item) => item.productId && item.seller)
      .map((item) => ({
        _id: item._id,
        status: item.status,
        agreedPrice: item.agreedPrice,
        lastOfferPrice: item.lastOfferPrice,
        lastMessage: item.lastMessage,
        lastMessageAt: item.lastMessageAt,
        quantity: item.quantity,
        updatedAt: item.updatedAt,
        seller: {
          id: item.seller._id,
          name: item.seller.name,
          storeName: item.seller.storeName || item.seller.name,
          email: item.seller.email || '',
          phone: item.seller.phone || ''
        },
        product: {
          id: item.productId._id,
          name: item.productId.name,
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
      let buyerId = message.buyerId?.toString();
      
      // Fallback for legacy messages: if sender is a buyer, use their ID
      if (!buyerId && message.sender?.role === 'buyer') {
        buyerId = message.sender._id?.toString() || message.sender.toString();
      }

      const productId = message.productId.toString();
      
      if (!buyerId || !productId) return;

      const conversationKey = `${productId}:${buyerId}`;

      if (conversationMap.has(conversationKey)) {
        return;
      }

      // If it's a seller message, we still want to show the conversation but we need the buyer's name
      // The buyerId is now always present in the message
      
      conversationMap.set(conversationKey, {
        id: conversationKey,
        buyerId: buyerId,
        productId: productId,
        lastMessage: message.text,
        offerPrice: message.offerPrice || null,
        quantity: message.quantity || 1,
        messageType: message.type,
        createdAt: message.createdAt,
        senderRole: message.sender?.role
      });
    });

    // We need to get buyer names for these conversations
     const buyerIds = Array.from(new Set(Array.from(conversationMap.values()).map(c => c.buyerId)));
     const buyers = await User.find({ _id: { $in: buyerIds } }).select('name');
     const buyerMap = new Map(buyers.map(b => [b._id.toString(), b.name]));

    const conversations = Array.from(conversationMap.values()).map(conv => ({
      ...conv,
      buyerName: buyerMap.get(conv.buyerId) || 'Buyer',
      buyerInitial: (buyerMap.get(conv.buyerId) || 'B').slice(0, 2).toUpperCase(),
      product: productMap.get(conv.productId)
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get real negotiation records for these conversations
    const negotiationRecords = await Negotiation.find({
      productId: { $in: sellerProductIds },
      seller: req.user._id
    });

    const recordMap = new Map(
      negotiationRecords.map(nr => [`${nr.productId}:${nr.buyer}`, nr])
    );

    // Filter conversations to only include those that have a recordMap entry or create one
    // But for the summary, if a record doesn't exist, we should probably auto-create it 
    // or at least allow it to be handled.
    // Let's make sure that if a record doesn't exist, we still provide enough info.

    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      let record = recordMap.get(conv.id);
      
      // If no negotiation record exists but we have messages, auto-create it to avoid "legacy" errors
      if (!record && conv.productId && conv.buyerId) {
        try {
          record = await Negotiation.findOneAndUpdate(
            { productId: conv.productId, buyer: conv.buyerId, seller: req.user._id },
            { 
              $setOnInsert: { 
                status: 'PENDING',
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.createdAt,
                quantity: conv.quantity
              } 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (err) {
          console.error('Error auto-creating negotiation record:', err);
        }
      }

      return {
        ...conv,
        negotiationId: record?._id || null,
        status: record?.status || 'PENDING',
        quantity: record?.quantity || conv.quantity || 1
      };
    }));

    // Only show PENDING requests on the dashboard summary to keep it actionable
    const visibleConversations = enrichedConversations.filter(conv => conv.status === 'PENDING');

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
      return res.status(404).json({ success: false, error: 'Negotiation record not found' });
    }

    // Verify ownership
    if (negotiation.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this negotiation' });
    }

    negotiation.status = status;
    await negotiation.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const payload = {
        productId: negotiation.productId.toString(),
        buyerId: negotiation.buyer.toString(),
        status: status,
        sender: 'seller',
        senderRole: 'seller',
        price: negotiation.agreedPrice || negotiation.lastOfferPrice,
        quantity: negotiation.quantity
      };
      
      // Emit to both specific and general rooms
      io.to(`${negotiation.productId}_${negotiation.buyer}`).emit('deal_update', payload);
      io.to(negotiation.productId.toString()).emit('deal_update', payload);
    }

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
      status: { $nin: ['PENDING', 'DECLINED'] }
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
