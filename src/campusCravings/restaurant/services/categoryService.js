'use strict'
const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const items = require('../models/items')
const mongoose = require('mongoose');

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
        const { id, ...itemData } = data;

        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError("Category not found", httpStatus.status.NOT_FOUND);
        }
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
        const item = await items.findById(itemId)

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
        console.log("Data to update:", data);

        const updatedCategory = await items.findOneAndUpdate(
            { "_id": _id },
            {
                $set: {
                    "items.$.name": newItem.name,
                    "items.$.price": newItem.price,
                    "items.$.description": newItem.description,
                    "items.$.estimated_preparation_time": newItem.estimated_preparation_time,
                    "items.$.customization": newItem.customization,
                    "items.$.image": newItem.image
                }
            },
            { new: true }
        );

        if (!updatedCategory) {
            throw new ApiError('Category or item not found', httpStatus.status.NOT_FOUND);
        }

        const updatedItem = updatedCategory.items.find(item => item._id.toString() === _id.toString());
        return updatedItem;

    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};

const deleteCategoryItem = async (id) => {
    try {
        const updatedCategory = await Category.findOneAndUpdate(
            { "items._id": id },
            { $pull: { items: { _id: id } } },
            { new: true }
        );

        if (!updatedCategory) {
            throw new Error('Category or item not found');
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