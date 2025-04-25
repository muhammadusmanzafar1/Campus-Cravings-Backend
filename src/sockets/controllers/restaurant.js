const Restaurant = require('../../campusCravings/restaurant/models/restaurant');
const User = require('../../auth/models/user');
const { restaurantSockets } = require('../store/socketStore');
const { getIO } = require('../service/socketService');

const isRestaurant = async ({ data, socket }) => {

    try
    {
        const { user } = data;

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isRestaurant == true && user.restaurant) 
        {
            const restaurant = await Restaurant.findById(user.restaurant);
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            console.log("Socket is Restaurant.")
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

        const restaurantUserId = await User.findOne({ isRestaurant: true, restaurant: restaurantId }).select('_id');
        if (!restaurantUserId) {
            throw new Error('Restaurant user not found');
        }

        console.log("Restaurant's UserId: " + restaurantUserId);

        const io = getIO();
        const socketId = restaurantSockets.get(restaurantUserId); // Get the socketId from the map
    
        if (socketId) {
            io.to(socketId).emit('new-customer-order', order);
            console.log(`Orders sent to restaurant ${restaurantUserId} with socketId ${socketId}`);
        } else {
            console.log(`Restaurant ${restaurantUserId} is not connected.`);
        }
    }
    catch (error) {
        console.log(error.message);
        throw new Error(error.message);
    }

};

module.exports = { isRestaurant, sendOrderToRestaurant };