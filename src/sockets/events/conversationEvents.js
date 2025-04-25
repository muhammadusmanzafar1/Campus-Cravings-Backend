const { messageSending, markMessageAsRead } = require('../controllers/conversationController');
const { sendMessageSchema, markMessageReadSchema } = require('../validators/conversation');

module.exports = (io, socket) => {

  // Event to join the private chat room between rider and customer
  socket.on('join-conversation', ({ conversationId}) => {
    try {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
    } catch (err) {
      console.error('Error in join-conversation:', err.message);
      socket.emit('chat-error', { error: `Failed to join conversation. Error: ${err.message}` });
    }
  });
  
  // Event for sending messages from rider to customer or vice versa
  socket.on('send-chat-message', async ({ conversationId, isCustomer, text }) => 
  {
    try 
    {
      const { error } = sendMessageSchema.validate({ conversationId, isCustomer, text });
      if (error) {
        throw new Error(error.details[0].message);
      }

      let senderId = socket.user._id;

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
    } catch (err) {
      console.error('Error in send-chat-message:', err.message);
      socket.emit('chat-error', { error: `Failed to send message. Error: ${err.message}` });
    }
  });

  // Event for marking a message as read
  socket.on('mark-message-read', async ({ messageId, isCustomer }) => {
    try {
 
      const { error } = markMessageReadSchema.validate({ messageId, isCustomer });
      if (error) {
        throw new Error(error.details[0].message);
      }

      let readerId = socket.user._id;

      const { response, message } = await markMessageAsRead({ data: { messageId, readerId, isCustomer } });

      if (response === 'SUCCESS') {

        // Broadcast read status to the conversation room
        io.to(message.conversation.toString()).emit('messages-read', {
          messageIds: message._id,
          readerId,
          readerType: message.senderModel == 'User' ? 'rider' : 'customer',
        });
  
        console.log(`Message ${messageId} marked as read by ${readerId}`);
      }
    } catch (err) {
      console.error('Error in mark-message-read:', err.message);
      socket.emit('chat-error', { error: `Failed to mark message as read. Error: ${err.message}` });
    }
  });
  
};