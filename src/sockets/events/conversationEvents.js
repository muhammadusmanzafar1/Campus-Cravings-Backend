const { messageSending, markMessageAsRead } = require('../controllers/conversation');
const { sendMessageSchema, markMessageReadSchema } = require('../validators/conversation');
const { handleSocketEvent } = require("../utils/socketHandler");

module.exports = (io, socket) => {

  // Event to join the private chat room between rider and customer
  socket.on('join-conversation', handleSocketEvent(async ({ conversationId }) => {
    await socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
    return { conversationId, message: 'Joined successfully' };
  }));
  
  // Event for sending messages from rider to customer or vice versa
  socket.on('send-chat-message', handleSocketEvent(async ({ conversationId, isCustomer, text }) => {
    const { error } = sendMessageSchema.validate({ conversationId, isCustomer, text });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const senderId = socket.user._id;
    const newMessage = await messageSending({ data: { conversationId, senderId, isCustomer, text } });

    io.to(conversationId).emit('receive-chat-message', {
      message: {
        _id: newMessage._id,
        senderId: newMessage.sender,
        senderModel: newMessage.senderModel,
        text: newMessage.text,
        status: newMessage.status,
        createdAt: newMessage.createdAt,
      },
    });

    console.log(`Message stored and emitted: ${text}`);
    return { messageId: newMessage._id };
  }));

  // Event for marking a message as read
  socket.on('mark-message-read', handleSocketEvent(async ({ messageId, isCustomer }) => {
    const { error } = markMessageReadSchema.validate({ messageId, isCustomer });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const readerId = socket.user._id;
    const { response, message } = await markMessageAsRead({ data: { messageId, readerId, isCustomer } });

    if (response === 'SUCCESS') {
      io.to(message.conversation.toString()).emit('messages-read', {
        messageIds: message._id,
        readerId,
        readerType: message.senderModel === 'User' ? 'rider' : 'customer',
      });

      console.log(`Message ${messageId} marked as read by ${readerId}`);
      return { messageId: message._id };
    } else {
      throw new Error('Failed to mark message as read');
    }
  }));
  
};