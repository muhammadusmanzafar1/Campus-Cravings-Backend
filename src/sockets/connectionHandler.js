const orderEvents = require('./events/orderEvents');
const conversationEvents = require('./events/conversationEvents');

module.exports = (io, socket) => {
    console.log(`Socket connected: ${socket.id}`);

    orderEvents(io, socket);
    conversationEvents(io, socket);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
};