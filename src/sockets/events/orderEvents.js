module.exports = (io, socket) => {
    socket.on('join-order-room', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} Joined room order-${orderId}`);
    });
};

//Emission mock logic for my reference
//   global.io.to(`order-${orderId}`).emit('order-status-updated', {
//     orderId,
//     status
//   });