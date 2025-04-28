const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price stock'
    });
    
    if (!cart) {
      // Create an empty cart for the user if none exists
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0
      });
    }
    
    res.json({
      success: true,
      cart
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

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, customization = {} } = req.body;
    
    // Find product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if quantity is valid
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0
      });
    }
    
    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.customization) === JSON.stringify(customization)
    );
    
    if (itemIndex > -1) {
      // Update quantity if item already exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        customization,
        price: product.discountPrice || product.price
      });
    }
    
    // Save the cart
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price stock'
    });
    
    res.status(201).json({
      success: true,
      cart
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

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Update item quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Save the cart
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price stock'
    });
    
    res.json({
      success: true,
      cart
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove the item from the cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    // Save the cart
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price stock'
    });
    
    res.json({
      success: true,
      cart
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

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear all items
    cart.items = [];
    
    // Save the cart
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart
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
