const Rider = require('../../campusCravings/rider/models/rider');
const { riderSockets } = require('../store/socketStore');
const { getIO } = require('../service/socketService');
const isRider = async ({ data, socket }) => {

    try 
    {
        const { user } = data;

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isDelivery == true) 
        {
            const rider = await Rider.findOne({ user: user._id });
            if (!rider) {
                throw new Error('Rider not found');
            }

            riderSockets.set(user._id.toString(), socket.id);

            console.log("Socket is Rider.")
        }

    }
    catch (error) {
        console.log(error.message);
        socket.emit('rider-connection-error', error.message);
    }

};

const sendOrderToSpecificRiders = async (riderIds, orders) => 
{
    try
    {
        const io = getIO();
        riderIds.forEach((riderId) => {
            const socketId = riderSockets.get(riderId.toString()); // Get the socketId from the map
    
            if (socketId) {
                io.to(socketId).emit('new-rider-order', orders);
                console.log(`Orders sent to rider ${riderId.toString()} with socketId ${socketId}`);
            } else {
                console.log(`Rider ${riderId.toString()} is not connected.`);
            }
        });
    }
    catch (error)
    {
        console.log(error.message);
        throw new Error(error.message);
    }
};

module.exports = { isRider, sendOrderToSpecificRiders };