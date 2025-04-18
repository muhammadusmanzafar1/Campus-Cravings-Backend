const userDb = require('../models/user');
const mongoose = require('mongoose');


const getById = async (id) => {
    return await userDb.findById(id);
};

const getByCondition = async (condition) => {
    return await userDb.findOne(condition)
};

const get = async (query) => {
    if (typeof query === 'string') {
        if (mongoose.Types.ObjectId.isValid(query)) {
            return getById(query);
        }
    }
    if (query.id) {
        return getById(query.id);
    }
    if (query.email) {
        return getByCondition({ email: query.email });
    }
    if (query.phone) {
        return getByCondition({ phone: query.phone });
    }
    if (query.username) {
        return getByCondition({ userName: query.username });
    }
    return null;
};


module.exports = {
    get,
}