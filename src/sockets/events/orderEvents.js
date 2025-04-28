const { handleSocketEvent } = require('../utils/socketHandler');

module.exports = (io, socket) => {
  socket.on('join-order-room', handleSocketEvent(async (data) => {
    const roomName = `order-${data.orderId}`;
    await socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
    return { orderId: data.orderId, message: 'Joined successfully' };
  }));
};

//Emission mock logic for my reference
//   io.to(`order-${orderId}`).emit('order-status-updated', {
//     orderId,
//     status
//   });