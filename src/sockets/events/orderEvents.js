module.exports = (io, socket) => {
    socket.on('join-order-room', (orderId) => {
      try
      {
        socket.join(`order-${orderId}`);
        console.log(`Socket ${socket.id} Joined room order-${orderId}`);
      }
      catch (error)
      {
        console.log(error.message);
        socket.emit('order-joining-error', error.message);
      }
    });
};

//Emission mock logic for my reference
//   io.to(`order-${orderId}`).emit('order-status-updated', {
//     orderId,
//     status
//   });