const orderEvents = require('./events/orderEvents');
const conversationEvents = require('./events/conversationEvents');
const riderEvents = require('./events/riderEvents');
const { riderSockets } = require('./store/riderSocketStore');

// Storing rider socket connections in a Map
module.exports = (io, socket) => {
    console.log(`Socket connected: ${socket.id} => User: ${socket.user._id}, name: ${socket.user.fullName}`);

    orderEvents(io, socket);
    conversationEvents(io, socket);
    riderEvents(io, socket, riderSockets);

    socket.on('disconnect', () => {

        for (let [riderId, riderSocketId] of riderSockets.entries()) {
            if (riderSocketId === socket.id) {
                riderSockets.delete(riderId);
                console.log(`Rider ${riderId} Disconnected`);
            }
        }
    
        console.log(`Socket disconnected: ${socket.id}`);
    });
};