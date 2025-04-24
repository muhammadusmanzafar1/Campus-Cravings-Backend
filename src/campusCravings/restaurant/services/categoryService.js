'use strict'
const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const items = require('../models/items')
const cloudinary = require('../../../../utils/cloudinary');

// Create a new category with items
const createCategory = async (req) => {

    const restaurantId = req.user.restaurant;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return null;
        }
        const category = new Category(req.body);
        category.restaurant = restaurantId;

        await category.save();
        restaurant.categories = category._id;
        await restaurant.save();
        return category;
    } catch (error) {
        console.error(error);

        if (error.name === "ValidationError") {
            throw new ApiError("Validation error: " + error.message, httpStatus.status.BAD_REQUEST);
        }

        if (error.name === "MongoError" && error.code === 11000) {
            throw new ApiError("Duplicate category entry", httpStatus.status.BAD_REQUEST);
        }

        throw new ApiError("An error occurred while creating the category", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const createItem = async (data) => {
    try {
        const { id, image, ...itemData } = data;
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError("Category not found", httpStatus.status.NOT_FOUND);
        }
        const uploadCloudnary = await cloudinary.uploader.upload(image);
        const imageUrl = uploadCloudnary.url;
        itemData.image = imageUrl;
        const itemsData = new items(itemData)
        itemsData.category = category._id;
        itemsData.restaurant = category.restaurant;
        await itemsData.save();
        category.items.push(itemsData._id);
        await category.save();

        return itemData;
    } catch (error) {

        throw new ApiError(error.message, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const getCategoryItemsById = async (itemId) => {
    try {
        const item = await items.findById(itemId).populate('category', 'name');

        if (!item) throw new Error('Item not found');
        return item;
    } catch (error) {
        console.error(error);
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};

const updateCategory = async (data) => {
    try {
        const { _id, ...newItem } = data;

        const updatedCategory = await items.findOneAndUpdate(
            {
                "_id": _id
            },
            {
                $set: {
                    ...newItem
                }
            },
            { new: true }
        );

        if (!updatedCategory) {
            throw new ApiError('Category or item not found', httpStatus.status.NOT_FOUND);
        }

        return updatedCategory;

    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};


const deleteCategoryItem = async (id) => {
    try {
        const updatedCategory = await items.findByIdAndDelete(id);

        if (!updatedCategory) {
            throw new ApiError('item not found', http.status.NOT_FOUND);
        }

        return "item deleted";
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};



module.exports = {
    createCategory,
    getCategoryItemsById,
    updateCategory,
    deleteCategoryItem,
    createItem
}