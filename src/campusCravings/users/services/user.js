const User = require('../../../auth/models/user');
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');

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
        const updatedUser = await user.save();
        if (!updatedUser) {
            throw new ApiError('Failed to update user', httpStatus.status.INTERNAL_SERVER_ERROR);
        }
        return user;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
module.exports = {
    addUserAddress
};