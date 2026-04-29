const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/:productId
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid product ID. Only database products can be added to cart.' 
      });
    }

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      // Update quantity if already in cart
      user.cart[cartItemIndex].quantity += (quantity || 1);
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.status(200).json({
      success: true,
      data: updatedUser.cart
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    const user = await User.findById(req.user.id);
    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json({
      success: true,
      data: updatedUser.cart
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json({
      success: true,
      data: updatedUser.cart
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      data: []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
