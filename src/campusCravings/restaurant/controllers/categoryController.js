'use strict'
const restCat = require('../services/categoryService');
const asyncHandler = require('express-async-handler');

exports.createCategory = asyncHandler(async (req, res) => {
    const category = await restCat.createCategory(req);
    return category;
});

exports.createItem = asyncHandler(async (req, res) => {
    const categories = await restCat.createItem(req.body);
    return categories;
});

exports.getItems = asyncHandler(async (req, res) => {
    const items = await restCat.getCategoryItemsById(req.params.id);
    return items;
});

exports.updateItems = asyncHandler(async (req, res) => {
    const updateData = req.body;

    const updatedCategory = await restCat.updateCategory(updateData);
    return updatedCategory;
});

exports.deleteItems = asyncHandler(async (req, res) => {
    const itemId = req.params.id;
    const deletedItem = await restCat.deleteCategoryItem(itemId);
    return deletedItem;
});
