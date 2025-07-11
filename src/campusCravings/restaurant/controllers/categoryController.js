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

exports.getCategoriesName = asyncHandler(async (req, res) => {
    const categories = await restCat.getCategoriesName(req);
    return categories;
});

exports.updateStatusItem = asyncHandler(async (req, res) => {
    const updatedItem = await restCat.updateStatusItem(req);
    return updatedItem;
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

exports.deleteCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const deletedCategory = await restCat.deleteCategory(categoryId);
    return deletedCategory;
});
