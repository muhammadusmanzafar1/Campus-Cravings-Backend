'use strict';
// const twilioConfig = require('config').get('twilio');
// const client = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);


/**
 * @param {string}phone
 * @param {object} body
 */
exports.sendSms = async (phone,body) => {
     try {
          const response = await client.messages.create({
               body: body,
               from: twilioConfig.phone,
               to: phone,
          });
          console.log(response.sid);
     } catch (error) {
          console.error(error);
        //   throw error;
        return 
     }
};


