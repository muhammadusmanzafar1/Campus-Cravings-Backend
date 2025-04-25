const Rider = require('../../campusCravings/rider/models/rider');
const { riderSockets } = require('../store/riderSocketStore');
const isRider = async ({ data }) => {

    try 
    {
        const { user } = data;

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isDelivery == false) {
            throw new Error('User is not a rider');
        }

        const rider = await Rider.findOne({ user: user._id });
        if (!rider) {
            throw new Error('Rider not found');
        }

    }
    catch (error) {
        console.log(error);
        throw new Error(error.message);
    }

};

const sendOrderToSpecificRiders = async (riderIds, orders) => 
{
    riderIds.forEach((riderId) => {
        const socketId = riderSockets.get(riderId); // Get the socketId from the map

        if (socketId) {
            global.io.to(socketId).emit('newOrder', orders);
            console.log(`Orders sent to rider ${riderId} with socketId ${socketId}`);
        } else {
            console.log(`Rider ${riderId} is not connected.`);
        }
    });
};

module.exports = { isRider, sendOrderToSpecificRiders };