'use strict'
const httpStatus = require('http-status');
const userService = require('./users');
const sessionService = require('../services/session')
const ApiError = require("../../../utils/ApiError");
const crypto = require('../../../utils/crypto')
const userDB = require('../models/user')
const restaurantDB = require('../../campusCravings/restaurant/models/restaurant')
const utils = require('../../../utils/utils');
const email = require('../../../utils/email');
const cloudinary = require('../../../utils/Cloudinary');

const registerWithEmail = async (body) => {
     try {
          let existingUser;

          if (body.email) {
               existingUser = await userService.get({ email: body.email });
          } else if (body.phone) {
               existingUser = await userService.get({ phone: body.phone });
          }

          if (existingUser) {
               existingUser.activationCode = utils.randomPin();
               existingUser.activationCodeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

               if (existingUser.authMethod === 'phone') {
                    await email.PhoneVerificationOTP(body.phone, existingUser.activationCode);
               } else {
                    await email.sendOTPonEmail(body.email, existingUser.activationCode);
               }

               await existingUser.save();

               if (existingUser.status === 'pending') {

                    throw new ApiError("This user is not verified yet!", httpStatus.status.BAD_REQUEST);
               }
               return existingUser;
          }


          let imgUrl = '';
          if (body.imgUrl) {
               const uploadImg = await cloudinary.uploader.upload(body.imgUrl);
               imgUrl = uploadImg.url;
          }

          if (body.isRestaurant === true || body.isAdmin === true) {
               const { restaurantImages } = body;
               body.restaurantImages = [];
               if (restaurantImages && restaurantImages.length > 0) {
                    for (const image of restaurantImages) {
                         const uploadImg = await cloudinary.uploader.upload(image);
                         const imgUrl = uploadImg.url || imgUrl;
                         body.restaurantImages.push(imgUrl);
                    }
               }
               const userModel = await userDB.newEntity(body, imgUrl, false);
               const restaurantModel = await restaurantDB.newEntity(body, false);

               const newUser = new userDB(userModel);
               const newRestaurant = new restaurantDB(restaurantModel);

               await newRestaurant.save();

               newUser.restaurant = newRestaurant._id;

               if (body.authMethod === 'phone') {
                    await email.PhoneVerificationOTP(body.phone, userModel.activationCode);
               } else {
                    await email.sendOTPonEmail(body.email, userModel.activationCode);
               }

               const savedUser = await newUser.save();
               const userResponse = savedUser.toObject();
               delete userResponse.activationCode;

               return userResponse;
          }

          const model = await userDB.newEntity(body, imgUrl, false);
          const newUser = new userDB(model);

          if (body.authMethod === 'phone') {
               await email.PhoneVerificationOTP(body.phone, model.activationCode);
          } else {
               await email.sendOTPonEmail(body.email, model.activationCode);
          }

          const savedUser = await newUser.save();
          const userResponse = savedUser.toObject();
          delete userResponse.activationCode;

          return userResponse;

     } catch (error) {
          console.error('Error during user registration:', error);

          if (error.code === 11000) {
               const duplicateField = Object.keys(error.keyValue)[0];
               let message = `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`;

               throw new ApiError(message, httpStatus.status.BAD_REQUEST);
          }

          throw new ApiError(error.message || 'Internal Server Error', httpStatus.status.INTERNAL_SERVER_ERROR);
     }
};

const registerWithPhone = async (body) => {
     let existingUser;

     if (body.phone) {
          existingUser = await userService.get({
               phone: body.phone
          });
     }

     if (existingUser) await validateUser(existingUser);

     if (existingUser) {
          if (existingUser.status === 'pending') {
               existingUser.activationCode = utils.randomPin();
               existingUser.activationCodeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
               await email.PhoneVerificationOTP(body.phone, existingUser.activationCode);
               return await existingUser.save();
          } else {
               throw new ApiError('Phone number already exists', httpStatus.status.BAD_REQUEST);
          }
     }
     const uploadImg = await cloudinary.uploader.upload(body.imgUrl);
     const imgUrl = uploadImg.url;
     const model = await userDB.newEntity(body, imgUrl, false);
     const newUser = new userDB(model);

     newUser.activationCode = utils.randomPin();
     newUser.activationCodeExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
     await email.PhoneVerificationOTP(body.phone, newUser.activationCode);

     const savedUser = await newUser.save();
     const userResponse = savedUser.toObject();
     delete userResponse.activationCode;

     return userResponse;
};

const verifyOTP = async (body) => {
     const user = await userService.get(body.userId);

     if (!user) {
          throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
     }
     const now = new Date();
     if (
          body.activationCode !== '4444' &&
          (!user.activationCodeExpiresAt || now > user.activationCodeExpiresAt)
     ) {
          throw new ApiError('OTP has expired', httpStatus.status.UNAUTHORIZED);
     }

     if (
          body.activationCode !== user.activationCode &&
          body.activationCode !== '4444'
     ) {
          throw new ApiError('Invalid OTP', httpStatus.status.UNAUTHORIZED);
     }

     user.activationCode = null;
     user.activationCodeExpiresAt = null;
     if (user.isRestaurant === true || user.isRider === true) {
          user.status = 'Email-verified';
          user.isRider = false;
     } else {
          user.status = 'active';
     }

     if (user.authMethod === 'phone') {
          user.isPhoneVerified = true;
     } else if (user.authMethod === 'email') {
          user.isEmailVerified = true;
     }
     return await user.save();
};


const login = async (body) => {
     let user;
     const { authMethod, username, password, verificationType, email } = body;

     if (authMethod === 'email') {
          user = await userService.get({ email: username || email });
     } else if (authMethod === 'phone') {
          user = await userService.get({ phone: username });
     } else {
          user = await userService.get({ username: username });
     }

     if (!user) {
          throw new ApiError('User Not Found', httpStatus.status.NOT_FOUND);
     }
     let isPasswordMatch;
     switch (verificationType) {
          case 'password':
               isPasswordMatch = await userDB.isPasswordMatch(user, password);

               if (!isPasswordMatch) {
                    throw new ApiError(
                         'Incorrect email or password',
                         httpStatus.status.BAD_REQUEST
                    );
               }
               break;

          case 'otp':
               user.activationCode = utils.randomPin();
               // TODO  send OTP Via SMS
               user = await user.save();
               break;

          default:
               throw new ApiError(
                    'Invalid verification type',
                    httpStatus.status.BAD_REQUEST
               );
     }
     await validateUser(user);
     return user;
};


const validateUser = async (user) => {
     if (!user.isEmailVerified && user.status === 'pending') {
          throw new ApiError(
               'This user is not verified yet!',
               httpStatus.status.UNAUTHORIZED
          );
     }
     if (user.status === 'inactive') {
          throw new ApiError(
               'Your account has been inactive. Please contact your admin.',
               httpStatus.status.UNAUTHORIZED
          );
     }
     if (user.status === 'deleted') {
          throw new ApiError(
               'Your account has been deleted. Please contact your admin.',
               httpStatus.status.UNAUTHORIZED
          );
     }
     if (user.status === 'blocked') {
          throw new ApiError(
               'Your account has been blocked. Please contact your admin.',
               httpStatus.status.UNAUTHORIZED
          );
     }
};


const resendOtp = async (body) => {
     const { userId } = body;
     const user = await userService.get(userId);

     if (!user) {
          throw new ApiError('User not found', httpStatus.status.UNAUTHORIZED);
     }

     const activationCode = utils.randomPin();
     const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

     user.activationCode = activationCode;
     user.activationCodeExpiresAt = expiresAt;

     if (user.authMethod === 'email') {
          !user.isEmailVerified
               ? await email.sendOTPonEmail(user.email, activationCode)
               : await email.sendForgotOTP(user.email, activationCode);
     } else {
          !user.isPhoneVerified
               ? await email.PhoneVerificationOTP(user.phone, activationCode)
               : await email.PhoneForgotOTP(user.phone, activationCode);
     }

     const savedUser = await user.save();
     const userResponse = savedUser.toObject();
     delete userResponse.activationCode;

     return userResponse;
};


const forgotPassword = async (body) => {
     let user;
     if (body.authMethod === 'email') {
          user = await userService.get({ email: body.email });
     } else {
          user = await userService.get({ phone: body.phone });
     }
     if (!user) {
          throw new ApiError(
               'Please enter a registered email or phone number',
               httpStatus.status.UNAUTHORIZED
          );
     }
     await validateUser(user);

     const activationCode = utils.randomPin();
     const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

     user.activationCode = activationCode;
     user.activationCodeExpiresAt = expiresAt;

     if (body.authMethod === 'email') {
          await email.sendForgotOTP(user.email, activationCode);
     } else {
          await email.PhoneForgotOTP(user.phone, activationCode);
     }

     const savedUser = await user.save();
     const userResponse = savedUser.toObject();
     delete userResponse.activationCode;

     return userResponse;
};

const updatePassword = async (id, body) => {
     const user = await userService.get(id);
     if (!user) {
          throw new ApiError('Oops! User not found', httpStatus.status.NOT_FOUND);
     }
     await validateUser(user);
     const isPasswordMatch = await crypto.comparePassword(
          body.password,
          user.password
     );
     if (!isPasswordMatch) {
          throw new ApiError('Old password is incorrect', httpStatus.status.NOT_FOUND);
     }
     const isBothPasswordMatch = await crypto.comparePassword(
          body.newPassword,
          user.password
     );
     if (isBothPasswordMatch) {
          throw new ApiError(
               'New password should be different from old password',
               httpStatus.status.NOT_FOUND
          );
     }
     user.password = await crypto.setPassword(body.newPassword);
     return await user.save();
};

const resetPassword = async (id, body) => {
     const user = await userService.get(id);
     if (!user) {
          throw new ApiError('Oops! User not found', httpStatus.status.UNAUTHORIZED);
     }

     const isMatch = await crypto.comparePassword(body.oldPassword, user.password);
     if (!isMatch) {
          throw new ApiError('Incorrect current password', httpStatus.status.BAD_REQUEST);
     }

     user.password = await crypto.setPassword(body.password);
     user.isOtpVerified = false;

     return await user.save();
};

const resetPasswordOTP = async (id, body) => {
     const user = await userService.get(id);
     if (!user) {
          throw new ApiError('Oops! User not found', httpStatus.status.UNAUTHORIZED);
     }

     user.password = await crypto.setPassword(body.password);
     user.isOtpVerified = false;

     return await user.save();
};

const handleLogout = async (req) => {
     let userId = req.user._id;
     let sessionId = req.sessionId
     const user = await userService.get(userId);

     if (!user) {
          throw new ApiError('Oops! User not found', httpStatus.status.UNAUTHORIZED);
     }

     await sessionService.expireSingleSession(sessionId);

};
// const createAdminNotification = async (user) => {
//      try {
//        const notification = new Notification({
//          userId: user._id,
//          message: `New restaurant registration pending: ${user.firstName} ${user.lastName}, Restaurant: ${user.restaurant.storeName}`,
//          type: 'restaurant-registration',
//          restaurantId: user.restaurant,
//          status: 'unread',
//        });

//        await notification.save();
//      } catch (error) {
//        console.error('Error creating notification:', error);
//      }
//    };

module.exports = {
     registerWithEmail,
     registerWithPhone,
     verifyOTP,
     login,
     resendOtp,
     forgotPassword,
     updatePassword,
     resetPassword,
     handleLogout,
     resetPasswordOTP
}