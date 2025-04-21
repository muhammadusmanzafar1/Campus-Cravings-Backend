const User = require('../../../auth/models/user');
const Ticket = require('../../admin/models/ticket')
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');

// fetch User Info 
const getUser = async (query) => {
    try {
        const userId = query.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
        }
        return user;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
// Update User Info
const updateUser = async ({ user: { _id }, body }) => {
    try {
        const user = await User.findById(_id);
        if (!user) throw new ApiError('User not found', httpStatus.status.NOT_FOUND);

        Object.assign(user, body);
        const updatedUser = await user.save();
        if (!updatedUser) {
            throw new ApiError('Failed to update user', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return await User.findById(_id).select('-password');
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

// Add New Address
const addUserAddress = async (query) => {
    try {
        const userId = query.user._id;
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
        }
        if (user.addresses.length >= 5) {
            throw new ApiError('User address limit reached', httpStatus.status.BAD_REQUEST);
        }
        const address = {
            address: query.body.address,
            coordinates: query.body.coordinates
        };
        user.addresses.push(address);
        console.log(address);
        const updatedUser = await user.save();
        if (!updatedUser) {
            throw new ApiError('Failed to update user', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return user;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

// Update Address
const updateUserAddress = async ({ user, body }) => {
    try {
        const foundUser = await User.findById(user._id);
        if (!foundUser) {
            throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
        }
        const { addressId, address, coordinates } = body;
        const targetAddress = foundUser.addresses.id(addressId);
        if (!targetAddress) {
            throw new ApiError('Address not found', httpStatus.status.NOT_FOUND);
        }
        Object.assign(targetAddress, {
            address,
            coordinates
        });
        const updatedUser = await foundUser.save();
        if (!updatedUser) {
            throw new ApiError('Failed to update address', httpStatus.INTERNAL_SERVER_ERROR);
        }
        return updatedUser;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
const getUserTickets = async (req) => {
    const tickets = await Ticket.find({ userId: req.user._id });
    return tickets;
};
module.exports = {
    getUser,
    addUserAddress,
    updateUserAddress,
    updateUser,
    getUserTickets
};