"use strict";
const crypto = require('crypto');

exports.randomPin = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.union = (arrayOne, arrayTwo, by) => {
  //Find values that are in arrayOne but not in arrayTwo
  const uniqueOne = arrayOne.filter(function (obj) {
    return !arrayTwo.some(function (obj2) {
      return obj[by] == obj2[by];
    });
  });
  //Find values that are in arrayTwo but not in arrayOne
  const uniqueTwo = arrayTwo.filter(function (obj) {
    return !arrayOne.some(function (obj2) {
      return obj[by] == obj2[by];
    });
  });

  return uniqueOne.concat(uniqueTwo);
};

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
exports.pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.hasOwn(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

exports.generateRandomAlphaNumeric = (length = 8) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset.charAt(randomIndex);
  }

  return result;
}

exports.isEmpty = (value) => {
  return !!(value === null || value === "" || typeof value === 'undefined');
}

exports.generateIdWithMiliSec = () => {
  const currentTimeStamp = Date.now();
  const milliseconds = new Date().getMilliseconds();
  const transactionId = `TXN${currentTimeStamp}${milliseconds}`;
  return transactionId;
}



exports.createUniqueCode = async (model) => `${Math.floor(Date.now() / 1000)}${crypto.randomBytes(3).toString('hex')}${String(await db[model].countDocuments()).padStart(5, '0')}`;
    
exports.extractErrorMessage = (text) => {
    const errorPrefix = " I'm sorry, I didn't quite understand the narrative you provided. Could you please clarify or provide a more detailed description?";
    const startIndex = text.indexOf(errorPrefix);

    if (startIndex !== -1) {
        const endIndex = text.indexOf('\n\n', startIndex);
        const errorMessage = text.substring(startIndex, endIndex !== -1 ? endIndex : undefined);
        return errorMessage.trim();
    }

    return null;
};

exports.jsonParse=(data) =>{
    try {
      if(JSON.parse(data)){
        return true
      }
    }
    catch(err){
        return false
    }
}