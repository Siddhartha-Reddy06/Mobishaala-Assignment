const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    customization: {
      type: Map,
      of: String,
      default: {}
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the total price whenever cart items change
CartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalPrice = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
