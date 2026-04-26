const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/negotiationController');
const { protect } = require('../middleware/auth');

router.get('/:productId', protect, getChatHistory);

module.exports = router;
