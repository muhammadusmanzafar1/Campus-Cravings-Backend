const Message = require('../../campusCravings/users/models/message');
const Rider = require('../../campusCravings/rider/models/rider');
const Conversation = require('../../campusCravings/users/models/conversation');

const messageSending = async ({ data }) => {
    try
    {
        let { conversationId, senderId, isCustomer, text } = data;

        if (isCustomer == false)
        {
            const rider = await Rider.findOne({ user: senderId });
            if (!rider) {
                throw new Error('Rider not found');
            }

            senderId = rider.user;
        }

        const conversation = await Conversation.findById(conversationId)
        .populate({
            path: 'rider',
            populate: { path: 'user' }
        })
        .lean();

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if ((isCustomer == true && conversation.customer.toString() != senderId.toString()) || (isCustomer == false && conversation.rider.user.toString() != senderId.toString())) {
            throw new Error('Unauthorized Sender');
        } 

        const newMessage = await Message.create({
            conversation: conversation._id,
            senderModel: isCustomer ? 'User' : 'Rider',
            sender: senderId,
            text: text,
        });
            
        return newMessage;

    }
    catch(error)
    {
        console.log(error);
        throw new Error(error.message);
    }
};

const markMessageAsRead = async ({ data }) => {
    try
    {
        let { messageId, readerId, isCustomer } = data;

        let response = "DEFAULT";

        if (isCustomer == false)
        {
            const rider = await Rider.findOne({ user: readerId });
            if (!rider) {
                throw new Error('Rider not found');
            }

            readerId = rider.user;
        }

        const message = await Message.findById(messageId)
        .populate({
            path: 'conversation',
            populate: {
                path: 'rider',
                populate: { path: 'user' }
            }
        })
        .lean();

        if (!message) {
            throw new Error('Message not found');
        }

        if (readerId.toString() != message.conversation.customer.toString() && readerId.toString() != message.conversation.rider.user.toString()) {
            throw new Error('Unauthorized Reader');
        }

        if (message.sender.toString() == readerId) {
            throw new Error('Sender cannot mark own message as read');
        }

        if (message.status == 'read') 
        {
            response = "ALREADY_READ";
        }
        else
        {
            message.status = 'read';
            await message.save();

            response = "SUCCESS";
        }

        return {response, message: message};
    }
    catch(error)
    {
        console.log(error);
        throw new Error(error.message);
    }
};

module.exports = { messageSending, markMessageAsRead };