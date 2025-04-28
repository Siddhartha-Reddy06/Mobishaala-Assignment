const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addItemToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes are protected
router.use(protect);

// Cart routes
router.route('/')
  .get(getCart)
  .post(addItemToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
