const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price must be positive']
  },
  images: [{
    url: String,
    alt: String
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock must be non-negative'],
    default: 0
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  customizationOptions: [{
    name: String,
    options: [String],
    required: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating when reviews are modified
ProductSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    if (this.reviews.length === 0) {
      this.ratings = 0;
    } else {
      this.ratings = this.reviews.reduce((acc, item) => acc + item.rating, 0) / this.reviews.length;
    }
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
