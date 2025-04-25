const Restaurant = require('../../campusCravings/restaurant/models/restaurant');
const { restaurantSockets } = require('../store/socketStore');
const { getIO } = require('../service/socketService');

const isRestaurant = async ({ data, socket }) => {

    try
    {
        const { user } = data;

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isRestaurant == true) 
        {
            const restaurant = await Restaurant.findOne({ user: user._id });
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }
        }

    }
    catch (error) {
        console.log(error.message);
        socket.emit('restaurant-connection-error', error.message);
    }
    
};

const sendOrderToRestaurant = async (restaurantId, order) => 
{
    try
    {
        const io = getIO();
        const socketId = restaurantSockets.get(restaurantId); // Get the socketId from the map
    
        if (socketId) {
            io.to(socketId).emit('new-customer-order', order);
            console.log(`Orders sent to restaurant ${restaurantId} with socketId ${socketId}`);
        } else {
            console.log(`Restaurant ${restaurantId} is not connected.`);
        }
    }
    catch (error) {
        console.log(error.message);
        throw new Error(error.message);
    }

};

module.exports = { isRestaurant, sendOrderToRestaurant };