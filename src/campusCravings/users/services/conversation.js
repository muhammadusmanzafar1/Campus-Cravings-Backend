const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Rider = require('../../rider/models/rider');
const Order = require('../../admin/models/order');
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');
const { getIO } = require('../../../sockets/service/socketService');

// fetch Conversation Details
const getConversationDetails = async (req) => {
    try {

        const { isCustomer, orderId } = req.body;
        let { _id } = req.user;
        const io = getIO();

        if (!_id) {
            throw new ApiError('id not found', httpStatus.status.NOT_FOUND);
        }

        if (isCustomer == false)
        {
            const rider = await Rider.findOne({ user: _id });
            if (!rider) {
                throw new ApiError('Rider not found', httpStatus.status.NOT_FOUND);
            }

            _id = rider._id;
        }
    
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError('Order not found', httpStatus.status.NOT_FOUND);
        }
    
        const populateOptions = isCustomer
            ? { path: 'customer' }
            : {
                path: 'rider',
                populate: {
                path: 'user',
                model: 'User',
                },
            };
    
        const conversation = await Conversation.findOne({ order: order._id })
            .populate(populateOptions)
            .lean();
    
        if (!conversation) {
            throw new ApiError('Conversation not found', httpStatus.status.NOT_FOUND);
        }

        if (_id.toString() != conversation.customer.user._id.toString() && _id.toString() != conversation.rider.user._id.toString()) {
            throw new ApiError('Unauthorized access (User not found in conversation)', httpStatus.status.UNAUTHORIZED);
        }

        // Handling Unread Messages
        const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

        const unreadMessages = messages.filter(
            (msg) => msg.sender.toString() !== _id.toString() && msg.status === 'sent'
        );
    
        const unreadMessageIds = unreadMessages.map((msg) => msg._id);
    
        if (unreadMessageIds.length > 0) 
        {
            await Message.updateMany(
            { _id: { $in: unreadMessageIds } },
            { $set: { status: 'read' } });

            io.to(conversation._id).emit('messages-read', { messageIds: unreadMessageIds, readerId: _id.toString(), readerType: isCustomer ? 'customer' : 'rider' });
        }

    
        const name = getParticipantName(conversation, isCustomer);

        return {
            conversationId: conversation._id,
            name,
            messages,
        };
  
    } catch (error) {
      console.error('Error in getConversationDetails:', error);
      throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
  };

function getParticipantName(conversation, isCustomer) {
    return isCustomer
      ? conversation.customer?.name || ''
      : conversation.rider?.user?.name || '';
}


module.exports = {
    getConversationDetails
};