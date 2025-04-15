"use strict";
const sendGridP = require("../src/auth/providers/sendGrid")
const twilioOTP =require("../src/auth/providers/twilio")
/**
 * 
 * @param {string} email 
 * @param {string} code 
 * @returns 
 */
exports.sendOTPonEmail = (email, code) => {
    const subject = "Account Registration OTP "
    const message = `Your OTP for Account Registration in Campus Cravings is: ${code}. Do not share the Credentials for security reasons.`
    return sendGridP.sendMail(email, { subject, body: message })

}
/**
 * 
 * @param {string} email 
 * @param {string} code 
 * @returns 
 */
exports.sendForgotOTP = async (email, code) => {
    const subject = "Forgot Password OTP";
    const message = `Your OTP for Forgot Password in Campus Cravings is: ${code}. Do not share the Credentials for security reasons.`;
    return sendGridP.sendMail(email, { subject, body: message });
};

/**
 * 
 * @param {string} phone 
 * @param {string} code 
 * @returns 
 */

exports.PhoneVerificationOTP = async (phone, code) => {
    // const subject = "Account Registration OTP "
    const message = `Your OTP for Account Registration in Novlt App is: ${code}. Do not share the Credentials for security reasons.`
    return twilioOTP.sendSms(phone, message);
};

/**
 * 
 * @param {string} phone 
 * @param {string} code 
 * @returns 
 */
exports.PhoneForgotOTP = async (phone, code) => {
    const message = `Your OTP for Forgot Password in Novlt App is: ${code}. Do not share the Credentials for security reasons.`;
    return twilioOTP.sendSms(phone, message);
};
