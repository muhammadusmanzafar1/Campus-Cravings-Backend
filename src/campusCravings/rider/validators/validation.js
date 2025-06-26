const Joi = require('joi');

const registerRiderSchema = {
    body: Joi.object({
        batch_year: Joi.string().required(),
        majors: Joi.array().items(Joi.string()).required(),
        monirs: Joi.array().items(Joi.string()).optional(),
        club_organizations: Joi.array().items(Joi.string()).optional(),
        bio: Joi.string().optional(),
        SSN: Joi.string().optional(),
        national_id_image_url: Joi.string().optional(),
        location: Joi.object({
            lat: Joi.number().required(),
            lng: Joi.number().required()
        }).required()
    })
};

const deliverOrderSchema = {
    body: Joi.object({
        orderId: Joi.string().required(),
        imageUrl : Joi.string().required()
    })
}

module.exports = {
    registerRiderSchema,
    deliverOrderSchema
};
