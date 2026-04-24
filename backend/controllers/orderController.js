const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    console.log('Order Data Received:', req.body);

    if (!req.user) {
      console.log('Auth error: req.user is undefined');
      return res.status(401).json({
        success: false,
        message: 'User not found, please login again'
      });
    }

    console.log('User ID from Token:', req.user._id);

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

    // Auto-advance status based on realistic shipping times (Days)
    const updatedOrders = await Promise.all(orders.map(async (order) => {
      let needsUpdate = false;
      const elapsedDays = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);

      // Processing for the first 12 hours
      if (order.status === 'Processing' && elapsedDays >= 0.5) {
        order.status = 'Shipped';
        needsUpdate = true;
      }
      // Shipped for the next 2 days
      if (order.status === 'Shipped' && elapsedDays >= 2.5) {
        order.status = 'Delivered';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await order.save();
      }
      return order;
    }));

    res.status(200).json({
      success: true,
      count: updatedOrders.length,
      data: updatedOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check if the order belongs to the user
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }

      // Auto-advance status based on realistic shipping times (Days)
      let needsUpdate = false;
      const elapsedDays = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);

      // Processing for the first 12 hours
      if (order.status === 'Processing' && elapsedDays >= 0.5) {
        order.status = 'Shipped';
        needsUpdate = true;
      }
      // Shipped for the next 2 days
      if (order.status === 'Shipped' && elapsedDays >= 2.5) {
        order.status = 'Delivered';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await order.save();
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
