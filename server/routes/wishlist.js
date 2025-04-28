const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @route    GET api/wishlist
// @desc     Get current user's wishlist
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products.product',
        select: 'name price image description'
      });

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/wishlist/:product_id
// @desc     Add product to wishlist
// @access   Private
router.post('/:product_id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.product_id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      });
    }

    // Check if product already exists in wishlist
    const productExists = wishlist.products.find(
      item => item.product.toString() === req.params.product_id
    );

    if (productExists) {
      return res.status(400).json({ msg: 'Product already in wishlist' });
    }

    // Add to wishlist
    wishlist.products.unshift({
      product: req.params.product_id
    });

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/wishlist/:product_id
// @desc     Remove product from wishlist
// @access   Private
router.delete('/:product_id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ msg: 'Wishlist not found' });
    }

    // Get remove index
    const removeIndex = wishlist.products
      .map(item => item.product.toString())
      .indexOf(req.params.product_id);

    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Product not in wishlist' });
    }

    wishlist.products.splice(removeIndex, 1);
    await wishlist.save();
    
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
