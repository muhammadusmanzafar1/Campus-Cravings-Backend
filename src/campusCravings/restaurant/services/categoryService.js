'use strict'
const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const items = require('../models/items')
const cloudinary = require('../../../../utils/Cloudinary');
const moment = require('moment-timezone');
const tzLookup = require('tz-lookup');

// Create a new category with items
const createCategory = async (req) => {

    const restaurantId = req.user.restaurant;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            throw new ApiError("Restaurant not found", httpStatus.status.NOT_FOUND);
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
            throw new ApiError(`Duplicate category entry ${error.message}`, httpStatus.status.BAD_REQUEST);
        }

        throw new ApiError(`An error occurred while creating the category: ${error.message}`, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const createItem = async (data) => {
    try {
        const { id, image, ...itemData } = data;
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError("Category not found", httpStatus.status.NOT_FOUND);
        }
        if (itemData.sizes && itemData.sizes.length > 0) {
            itemData.price = 0;
        }
        const newImageArray = [];
        for (let i = 0; i < image.length; i++) {
            const uploadCloudnary = await cloudinary.uploader.upload(image[i]);
            const imageUrl = uploadCloudnary.url;
            newImageArray.push(imageUrl);
        }
        itemData.image = newImageArray;
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
        const item = await items.findOne({ _id: itemId, out_of_stock: false }).populate('category', 'name');

        if (!item) throw new Error('Item not found');
        return item;
    } catch (error) {
        console.error(error);
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};

const getCategoriesName = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        // Validate required parameters
        if (!latitude || !longitude) {
            throw new ApiError("Missing required parameters: latitude and longitude are required.", httpStatus.status.BAD_REQUEST);
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const distanceInMeters = 20 * 1609.34;

        // Fetch nearby restaurants
        const nearbyRestaurants = await Restaurant.find({
            "addresses.coordinates": {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    $maxDistance: distanceInMeters,
                },
            },
        });

        // Filter open restaurants
        const openRestaurants = nearbyRestaurants.filter((restaurant) => {
            const coords = restaurant.addresses?.coordinates?.coordinates;
            if (!coords || coords.length !== 2) return false;

            const [restLng, restLat] = coords;

            let timeZone;
            try {
                timeZone = tzLookup(restLat, restLng);
            } catch (err) {
                console.warn(`Timezone lookup failed for ${restaurant.storeName}: ${err.message}`);
                return false;
            }

            const now = moment.tz(timeZone);
            const day = now.format('dddd').toLowerCase();
            const timeRange = restaurant.openingHours?.[day];

            if (!timeRange || !timeRange.includes('-')) return false;

            const [openStr, closeStr] = timeRange.split('-').map((s) => s.trim());
            const openTime = moment.tz(openStr, 'hh:mm A', timeZone).set({
                year: now.year(),
                month: now.month(),
                date: now.date()
            });
            let closeTime = moment.tz(closeStr, 'hh:mm A', timeZone).set({
                year: now.year(),
                month: now.month(),
                date: now.date()
            });

            if (closeTime.isBefore(openTime)) {
                closeTime.add(1, 'day');
            }

            return now.isBetween(openTime, closeTime);
        });

        const openRestaurantIds = openRestaurants.map((r) => r._id);
        const categories = await Category.aggregate([
            {
                $match: {
                    restaurant: { $in: openRestaurantIds },
                    items: { $exists: true, $not: { $size: 0 } },
                },
            },
            {
                $sort: { created_at: -1 }
            },
            {
                $group: {
                    _id: "$name", 
                    doc: { $first: "$$ROOT" } 
                },
            },
            {
                $replaceRoot: { newRoot: "$doc" } 
            }
        ]);


        return categories;

    } catch (error) {
        console.error("Error while fetching nearby categories:", error);
        const status = error instanceof ApiError ? error.statusCode : httpStatus.status.INTERNAL_SERVER_ERROR;
        const message = error.message || "Internal Server Error";

        throw new ApiError(message, status);
    }
};

const updateStatusItem = async (req) => {
    const { id } = req.params;
    const { status } = req.query;
    try {
        const item = await items.findById(id);
        if (!item) {
            throw new ApiError("Item not found", httpStatus.status.NOT_FOUND);
        }
        item.out_of_stock = status;
        await item.save();20
        return item;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
    
}

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
        const item = await items.findById(id);
        if (!item) {
            throw new ApiError("Item not found", httpStatus.status.NOT_FOUND);
        }
        await items.findByIdAndDelete(id);
        await Category.updateOne(
            { _id: item.category },
            { $pull: { items: item._id } }
        );
        return "Item deleted and removed from category";
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};

const deleteCategory = async (id) => {
    try {
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError("Category not found", httpStatus.status.NOT_FOUND);
        }
        await items.deleteMany({ _id: { $in: category.items } });
        await Category.findByIdAndDelete(id);
        return "Category and its items deleted successfully";
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};



module.exports = {
    createCategory,
    getCategoryItemsById,
    updateCategory,
    deleteCategoryItem,
    createItem,
    deleteCategory,
    getCategoriesName,
    updateStatusItem
}