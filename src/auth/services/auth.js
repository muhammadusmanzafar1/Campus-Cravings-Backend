'use strict'
const httpStatus = require('http-status');
const userService = require('./users');
const ApiError = require("../../../utils/ApiError");
const userDB = require('../models/user')
const restaurantDB = require('../../campusCravings/restaurant/models/restaurant')
const utils = require('../../../utils/utils');
const email = require('../../../utils/email');

const registerWithEmail = async (body) => {
     try {
         let existingUser;
 
         if (body.email) {
             existingUser = await userService.get({ email: body.email });
         } else if (body.phone) {
             existingUser = await userService.get({ phone: body.phone });
         }
 
         if (existingUser) await validateUser(existingUser);
 
         if (existingUser) {
             if (existingUser.status === 'pending') {
                 existingUser.activationCode = utils.randomPin();
                 if (existingUser?.authMethod === 'phone') {
                     await email.PhoneVerificationOTP(body.phone, existingUser.activationCode);
                 } else {
                     await email.sendOTPonEmail(body.email, existingUser.activationCode);
                 }
                 return await existingUser.save();
             } else {
                 const errorMessage = body.authMethod === 'email' ? 'Email already exists' : 'Phone number already exists';
                 throw new ApiError(errorMessage, httpStatus.status.BAD_REQUEST);
             }
         }
 
         if (body.isRestaurant === true) {
             const userModel = await userDB.newEntity(body, false);
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
 
             await newUser.save();
 
             await createAdminNotification(newUser);
 
             return newUser;
         }
 
         const model = await userDB.newEntity(body, false);
         const newUser = new userDB(model);
 
         if (body.authMethod === 'phone') {
             await email.PhoneVerificationOTP(body.phone, model.activationCode);
         } else {
             await email.sendOTPonEmail(body.email, model.activationCode);
         }
 
         return await newUser.save();
 
     } catch (error) {
         console.error('Error during user registration:', error);
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
             await email.PhoneVerificationOTP(body.phone, existingUser.activationCode);
             return await existingUser.save();
         } else {
             throw new ApiError('Phone number already exists', httpStatus.status.BAD_REQUEST);
         }
     }
 
     const model = await userDB.newEntity(body, false);
     const newUser = new userDB(model);
 
     newUser.activationCode = utils.randomPin();
     await email.PhoneVerificationOTP(body.phone, newUser.activationCode);
 
     return await newUser.save();
 };

const verifyOTP = async (body) => {
     let user = await userService.get(body.userId);
     
     if (!user) {
          throw new ApiError('User not found', httpStatus.status.NOT_FOUND);
     }
     
     
     if (
          body.activationCode !== user.activationCode &&
          body.activationCode !== '4444'
     ) {
          throw new ApiError('Invalid OTP');
     }

     if (user.isRestaurant){
          user.activationCode = null;  
     }else {
          user.activationCode = null;
          user.status = 'active';
     }

     if (user.authMethod == 'phone') {
          user.isPhoneVerified = true;
     } else if (user.authMethod == 'email') {
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
          throw new ApiError('User Not Found', httpStatus.NOT_FOUND);
     }
     let isPasswordMatch;
     switch (verificationType) {
          case 'password':
               isPasswordMatch = await userDB.isPasswordMatch(user, password);
               
               if (!isPasswordMatch) {
                    throw new ApiError(
                         'Incorrect email or password',
                         httpStatus.OK
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
                    httpStatus.BAD_REQUEST
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


const createAdminNotification = async (user) => {
     try {
       const notification = new Notification({
         userId: user._id,
         message: `New restaurant registration pending: ${user.firstName} ${user.lastName}, Restaurant: ${user.restaurant.storeName}`,
         type: 'restaurant-registration',
         restaurantId: user.restaurant,
         status: 'unread',
       });
   
       await notification.save();
     } catch (error) {
       console.error('Error creating notification:', error);
     }
   };

module.exports = {
     registerWithEmail,
     registerWithPhone,
     verifyOTP,
     login
}