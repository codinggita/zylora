const Order = require('../models/Order');
const Product = require('../models/Product');

const syncOrderStatus = async (order) => {
  let needsUpdate = false;
  const elapsedDays = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);

  if (order.status === 'Processing' && elapsedDays >= 0.5) {
    order.status = 'Shipped';
    needsUpdate = true;
  }

  if (order.status === 'Shipped' && elapsedDays >= 2.5) {
    order.status = 'Delivered';
    needsUpdate = true;
  }

  if (needsUpdate) {
    await order.save();
  }

  return order;
};

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

    const updatedOrders = await Promise.all(orders.map(syncOrderStatus));

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

      await syncOrderStatus(order);

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

// @desc    Get orders containing the logged in seller's products
// @route   GET /api/orders/seller-orders
// @access  Private/Seller
exports.getSellerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can view seller orders'
      });
    }

    const sellerProducts = await Product.find({ seller: req.user._id })
      .select('_id name images price');

    const sellerProductMap = new Map(
      sellerProducts.map((product) => [
        product._id.toString(),
        {
          id: product._id.toString(),
          name: product.name,
          image: product.images?.[0] || 'https://via.placeholder.com/300',
          price: product.price
        }
      ])
    );

    const sellerProductIds = Array.from(sellerProductMap.keys());

    if (sellerProductIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const orders = await Order.find({
      'orderItems.product': { $in: sellerProductIds }
    })
      .populate('user', 'name email phone')
      .sort('-createdAt');

    const updatedOrders = await Promise.all(orders.map(syncOrderStatus));

    const sellerOrders = updatedOrders.map((order) => {
      const sellerItems = order.orderItems
        .filter((item) => sellerProductMap.has(item.product))
        .map((item) => {
          const productMeta = sellerProductMap.get(item.product);

          return {
            ...item.toObject(),
            productDetails: productMeta
          };
        });

      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      return {
        ...order.toObject(),
        customer: {
          id: order.user?._id,
          name: order.user?.name || order.shippingAddress?.name || 'Customer',
          email: order.user?.email || '',
          phone: order.user?.phone || order.shippingAddress?.mobile || ''
        },
        sellerItems,
        sellerItemCount: sellerItems.reduce((sum, item) => sum + item.quantity, 0),
        sellerTotal
      };
    });

    res.status(200).json({
      success: true,
      count: sellerOrders.length,
      data: sellerOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
