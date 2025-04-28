const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Protect all order routes
router.use(protect);

// User routes
router.route('/')
  .post(createOrder);

router.get('/myorders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

// Admin routes
router.route('/')
  .get(admin, getOrders);

router.put('/:id/deliver', admin, updateOrderToDelivered);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
