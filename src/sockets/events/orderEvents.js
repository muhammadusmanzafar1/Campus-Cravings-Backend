module.exports = (io, socket) => {
    socket.on('join-order-room', (orderId) => {
      try
      {
        socket.join(`order-${orderId}`);
        console.log(`Socket ${socket.id} Joined room order-${orderId}`);
        socket.emit('order-room-joined', { orderId, message: 'Joined successfully' });
      }
      catch (error)
      {
        console.log(error.message);
        socket.emit('order-joining-error', { error: `Failed to join order room. ${error.message}` });
      }
    });
};

//Emission mock logic for my reference
//   io.to(`order-${orderId}`).emit('order-status-updated', {
//     orderId,
//     status
//   });