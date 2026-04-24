const express = require('express');
const { 
  getProducts, 
  createProduct, 
  getProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.route('/myproducts')
  .get(protect, getMyProducts);

router.route('/:id')
  .get(getProduct);

module.exports = router;
