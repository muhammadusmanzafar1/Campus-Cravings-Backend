const { isRider } = require('../controllers/riderController');
module.exports = (io, socket, riderSockets) => 
{
    socket.on('rider-listening-for-orders', async() => {
        try
        {
            await isRider({ data: { user: socket.user }});
            riderSockets.set(socket.user._id, socket.id);
            console.log(`Rider ${socket.user._id} with name ${socket.user.fullName} Registered`);
        }
        catch (error)
        {
            console.log(error.message);
            socket.emit('rider-connection-error', error.message);
        }

    });

    socket.on('rider-not-listening-for-orders', async() => {

        try
        {
            await isRider({ data: { user: socket.user }});
            riderSockets.delete(socket.user._id);
            console.log(`Rider ${socket.user._id} with name ${socket.user.fullName} Unregistered`); 
        }
        catch (error)
        {
            console.log(error.message);
            socket.emit('rider-connection-error', error.message);
        }

    });


};