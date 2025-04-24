const User = require('../../../auth/models/user');
const Restaurant = require('../../restaurant/models/restaurant')
const Ticket = require('../../admin/models/ticket')
const userService = require('../../../auth/services/users');
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

const getAllUsers = async (req, res) => {
    try {
        const filterType = req.query.type; // 'all', 'restaurant', 'rider', 'customer'
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || ''; // search on firstName

        let filter = {};

        // Apply user type filter
        switch (filterType) {
            case 'restaurant':
                filter.isRestaurant = true;
                break;
            case 'rider':
                filter.isDelivery = true;
                break;
            case 'customer':
                filter.isCustomer = true;
                break;
            case 'admin':
                filter.isAdmin = true;
                break;
            case 'all':
            default:
                break;
        }

        // If search is provided, filter only by search (within the given type)
        if (search) {
            filter.firstName = { $regex: search, $options: 'i' }; // case-insensitive match
        }

        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        return {
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            }
        }
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};




const newUser = async (req) => {
    const body = req.body;
    const isAdmin = req.user?.isAdmin;
     try {
          let existingUser;

          if (body.email) {
               existingUser = await userService.get({ email: body.email });
          } else if (body.phone) {
               existingUser = await userService.get({ phone: body.phone });
          }

          if (existingUser) throw new ApiError("This user is already Registered", httpStatus.status.FORBIDDEN);


          if (body.isRestaurant === true) {
               const userModel = await User.newEntity(body, isAdmin);
               const restaurantModel = await Restaurant.newEntity(body, isAdmin);

               const newUser = new User(userModel);
               const newRestaurant = new Restaurant(restaurantModel);

               await newRestaurant.save();

               newUser.restaurant = newRestaurant._id;

               const savedUser = await newUser.save();
               const userResponse = savedUser.toObject();
               delete userResponse.activationCode;

               return userResponse;
          }

          const model = await User.newEntity(body, false);
          const newUser = new User(model);

          const savedUser = await newUser.save();
          const userResponse = savedUser.toObject();
          delete userResponse.activationCode;

          return userResponse;

     } catch (error) {
        if (!(error instanceof ApiError)) {
            console.error('Unexpected error during user registration:', error);
        }
    
        throw error instanceof ApiError
            ? error
            : new ApiError(error.message || 'Internal Server Error', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id
    try {
        const existing = await User.findById(userId);

        if (!existing) throw new ApiError("No User Found", httpStatus.status.NOT_FOUND);

        const data = await User.findByIdAndDelete(userId);
        return data
    } catch (error) {
        if (!(error instanceof ApiError)) {
            console.error('Unexpected error during user registration:', error);
        }
    
        throw error instanceof ApiError
            ? error
            : new ApiError(error.message || 'Internal Server Error', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getUser,
    addUserAddress,
    updateUserAddress,
    updateUser,
    getUserTickets,
    getAllUsers,
    newUser,
    deleteUser
};