const express = require('express');
const router = express.Router();

router.use('/tickets', require('./ticketRoute'));
router.use('/order', require('./orderRoute'));

module.exports = router;
