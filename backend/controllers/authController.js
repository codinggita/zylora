const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    let { name, email, password, role, phone, storeName, gstNumber, businessAddress } = req.body;

    // Clean inputs
    email = email ? email.toLowerCase().trim() : email;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      storeName,
      gstNumber,
      businessAddress
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    // Clean inputs
    email = email ? email.toLowerCase().trim() : email;
    password = password ? password.trim() : password;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if role matches if provided
    if (role && user.role !== role) {
      return res.status(401).json({ 
        success: false, 
        error: `This account is registered as a ${user.role}. Please login through the correct portal.` 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      storeName: req.body.storeName,
      gstNumber: req.body.gstNumber,
      businessAddress: req.body.businessAddress
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If it's the first address, make it selected
    if (user.addresses.length === 0) {
      req.body.selected = true;
    } else if (req.body.selected) {
      // Unselect others
      user.addresses.forEach(addr => addr.selected = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    if (req.body.selected) {
      user.addresses.forEach(addr => addr.selected = false);
    }

    address.set(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const wasSelected = address.selected;
    address.deleteOne();
    
    // If we deleted the selected address and have others, select the first one
    if (wasSelected && user.addresses.length > 0) {
      user.addresses[0].selected = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Select address
// @route   PUT /api/auth/addresses/:id/select
// @access  Private
exports.selectAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    user.addresses.forEach(addr => {
      addr.selected = addr._id.toString() === req.params.id;
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    _meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
};
