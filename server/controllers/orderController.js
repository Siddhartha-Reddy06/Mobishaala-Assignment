const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentMethod,
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price stock'
    });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }
    
    // Check if all items are in stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product ? product.name : 'Product'} is out of stock or has insufficient quantity`
        });
      }
    }
    
    // Calculate prices
    const itemsPrice = cart.totalPrice;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2)); // 18% tax
    const shippingPrice = itemsPrice > 1000 ? 0 : 100; // Free shipping for orders above 1000
    const totalPrice = itemsPrice + taxPrice + shippingPrice;
    
    // Create order items from cart
    const orderItems = cart.items.map(item => {
      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.images.length > 0 ? item.product.images[0].url : '',
        price: item.price,
        customization: item.customization
      };
    });
    
    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });
    
    // Save the order
    const createdOrder = await order.save();
    
    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    // Check if order exists and belongs to user or user is admin
    if (!order || (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    
    // Add payment result info from payment gateway
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.status = status;
    
    // Update delivered status based on status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(query)
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    // Get total count for pagination
    const count = await Order.countDocuments(query);
    
    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
