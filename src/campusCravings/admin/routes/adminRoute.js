const express = require('express');
const router = express.Router();

router.use('/tickets', require('./ticketRoute'));
router.use('/order', require('./orderRoute'));
router.use("/orderitem", require("./orderItemRoute"));

module.exports = router;
