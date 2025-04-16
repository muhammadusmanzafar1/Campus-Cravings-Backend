'use strict'
const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Category = require('../models/category');
const mongoose = require('mongoose');

// Create a new category with items
const createCategory = async (data) => {
  try {
    const category = new Category(data);
    await category.save();
    return category;
  } catch (error) {
    throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
  }
};

const getCategoryItemsById = async (itemId) => {
    try {
        const item = await Category.aggregate([
          { $unwind: "$items" },
          { $match: { "items._id": mongoose.Types.ObjectId.createFromHexString(itemId) } },
          { $project: { "items": 1 } } 
        ]);
    
        if (item.length === 0) throw new Error('Item not found'); 
        return item[0].items; 
      } catch (error) {
        console.error(error);
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
      }
};

const updateCategory = async (data) => {
    try {
      const { _id, ...newItem } = data;
      console.log("Data to update:", data);

      const updatedCategory = await Category.findOneAndUpdate(
        { "items._id": _id },
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
  
      console.log("Updated Category:", updatedCategory);
  
      if (!updatedCategory) {
        throw new Error('Category or item not found');
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
    deleteCategoryItem
}