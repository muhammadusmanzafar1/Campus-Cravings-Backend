const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Rider = require('../../rider/models/rider');
const Order = require('../../admin/models/order');
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');
const { getIO } = require('../../../sockets/service/socketService');

// fetch Conversation Details
const getConversationDetails = async (req, { isCustomer, orderId }) => {
    try {

        // console.log("isCustomer: " + isCustomer  + typeof isCustomer);
        // console.log("orderId: " + orderId + typeof orderId);
        // console.log("req.user: " + req.user);

        let { _id } = req.user;
        const io = getIO();

        if (!_id) {
            throw new ApiError('id not found', httpStatus.status.NOT_FOUND);
        }

        if (isCustomer == false)
        {
            console.log("isCustomer is false");
            const rider = await Rider.findOne({ user: _id });
            if (!rider) {
                throw new ApiError('Rider not found', httpStatus.status.NOT_FOUND);
            }

            _id = rider.user;
        }
    
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError('Order not found', httpStatus.status.NOT_FOUND);
        }
    
        const conversation = await Conversation.findOne({ order: order._id })
        .populate({
            path: 'rider',
            populate: { path: 'user' }
        })
        .populate('customer')
        .lean();
    
        if (!conversation) {
            throw new ApiError('Conversation not found', httpStatus.status.NOT_FOUND);
        }
        // console.log(conversation);
        console.log("_id: " + _id.toString() + " conversation.customer: " + conversation.customer._id.toString() + " conversation.rider.user: " + conversation.rider.user._id.toString());

        if (_id.toString() != conversation.customer._id.toString() && _id.toString() != conversation.rider.user._id.toString()) {
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

            io.to(conversation._id.toString()).emit('messages-read', { messageIds: unreadMessageIds, readerId: _id.toString(), readerType: isCustomer ? 'User' : 'Rider' });
        }

        const name = getOtherParticipantName(isCustomer, conversation);

        return {
            conversationId: conversation._id,
            name: name,
            messages,
        };
  
    } catch (error) {
      console.error('Error in getConversationDetails:', error);
      throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const getOtherParticipantName = (isCustomer, conversation) => {
    return isCustomer ? conversation.rider.user.fullName : conversation.customer.fullName;
};


module.exports = {
    getConversationDetails
};