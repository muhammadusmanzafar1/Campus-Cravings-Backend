const express = require('express');
const router = express.Router();

router.use('/tickets', require('./ticketRoute'));
router.use('/orderItem', require('./orderItemRoute'));

module.exports = router;
