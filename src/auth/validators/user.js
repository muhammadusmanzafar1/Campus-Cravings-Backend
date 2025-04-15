const Joi = require('joi');
const { password, phone, pageSchema } = require('../../../validators/common.validation');


const createUser = {
    body: Joi.object().keys({
        authMethod: Joi.string().required().valid('email', 'phone'),
        firstName: Joi.string(),
        lastName: Joi.string(),
        fullName: Joi.string(),
        ISOCode: Joi.string(),
        imgUrl: Joi.string().allow(null, '').default(null),
        phone: Joi.string().required().custom(phone),
        email: Joi.string().required().email().lowercase(),
        password: Joi.string().required().custom(password)
    })
};

const updateUser = {
    body: Joi.object().keys({
        fullName: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        ISOCode: Joi.string(),
        phone: Joi.string(),
        imgUrl: Joi.string().allow(null, '').default(null),
        about: Joi.string(),
    })
};

const search = {
    query: Joi.object().keys({
        status: Joi.string().default('active'),
        search: Joi.string(),
        ...pageSchema
    })
};

const get = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const remove = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const updateUsername = {
    body: Joi.object().keys({
        userName: Joi.string().required()
    })
};

module.exports = {
    createUser,
    updateUser,
    search,
    get,
    remove,
    updateUsername
};