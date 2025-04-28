const { messageSending, markMessageAsRead } = require('../controllers/conversation');
const { sendMessageSchema, markMessageReadSchema } = require('../validators/conversation');
const { handleSocketEvent } = require("../utils/socketHandler");

module.exports = (io, socket) => {

// JOIN CONVERSATION
socket.on('join-conversation', handleSocketEvent(async (data) => {
  const conversationId = data?.conversationId;
  
  if (!conversationId || typeof conversationId !== 'string') {
    console.warn(`Invalid or missing conversationId in 'join-conversation':`, data);
    return { error: 'Invalid conversationId' };
  }

  await socket.join(conversationId);
  console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
  return { conversationId, message: 'Joined successfully' };
}));

// SEND MESSAGE
socket.on('send-chat-message', handleSocketEvent(async (data) => {
  const { conversationId, isCustomer, text } = data || {};

  const { error } = sendMessageSchema.validate({ conversationId, isCustomer, text });
  if (error) {
    console.warn(`Validation error in 'send-chat-message':`, error.details[0].message);
    return { error: error.details[0].message };
  }

  const senderId = socket.user?._id;
  if (!senderId) {
    console.warn('Unauthenticated socket tried to send message');
    return { error: 'Unauthorized' };
  }

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

  console.log(`Message stored and emitted to ${conversationId}: ${text}`);
  return { messageId: newMessage._id };
}));

// MARK MESSAGE AS READ
socket.on('mark-message-read', handleSocketEvent(async (data) => {
  const { messageId, isCustomer } = data || {};

  const { error } = markMessageReadSchema.validate({ messageId, isCustomer });
  if (error) {
    console.warn(`Validation error in 'mark-message-read':`, error.details[0].message);
    return { error: error.details[0].message };
  }

  const readerId = socket.user?._id;
  if (!readerId) {
    console.warn('Unauthenticated socket tried to mark message read');
    return { error: 'Unauthorized' };
  }

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
    console.error(`Failed to mark message ${messageId} as read`);
    return { error: 'Failed to mark message as read' };
  }
}));
};