const orderEvents = require('./events/orderEvents');
const conversationEvents = require('./events/conversationEvents');
const { isRider } = require('./controllers/rider');
const { isRestaurant } = require('./controllers/restaurant');
const { riderSockets, restaurantSockets } = require('./store/socketStore');

// Storing rider socket connections in a Map
module.exports = async(io, socket) => {

    if (!socket.user) {
        console.log(`Socket ${socket.id} has no user data`); // User data is not available for this socket connection
        return socket.disconnect(); // Disconnect the socket connection
    }

    await isRider({ data: { user: socket.user }, socket });
    await isRestaurant({ data: { user: socket.user }, socket });

    console.log(`Socket connected: ${socket.id} => User: ${socket.user._id}, name: ${socket.user.fullName}`);

    orderEvents(io, socket);
    conversationEvents(io, socket);

    socket.on('disconnect', () => {

        for (let [riderId, riderSocketId] of riderSockets.entries()) {
            if (riderSocketId === socket.id) {
                riderSockets.delete(riderId);
                console.log(`Rider ${riderId} Disconnected`);
            }
        }

        for (let [restaurantId, restaurantSocketId] of restaurantSockets.entries()) {
            if (restaurantSocketId === socket.id) {
                restaurantSockets.delete(restaurantId);
                console.log(`Restaurant ${restaurantId} Disconnected`);
            }
        }
    
        console.log(`Socket disconnected: ${socket.id}`);
    });
};