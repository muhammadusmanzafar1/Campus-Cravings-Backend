const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Rider = require('../models/rider');
const Restaurant = require('../../restaurant/models/restaurant')
const User = require('../../../auth/models/user')
const Order = require('../../admin/models/order')
const Conversation = require('../../users/models/conversation')
const { differenceInMinutes } = require('date-fns');
const haversine = require('haversine-distance');
const { patchOrder } = require('../../admin/services/order')
const cloudinary = require('../../../../utils/cloudinary');
const { getIO } = require('../../../sockets/service/socketService');
const { sendOrderToSpecificRiders } = require('../../../sockets/controllers/rider');
const order = require('../../admin/models/order');
const { default: mongoose } = require('mongoose');


exports.registerRider = async (req, res) => {
  try {
    const userId = req.user._id;

    const existing = await Rider.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered as a rider' });
    }
    const {
      location,
      batch_year,
      majors,
      monirs,
      club_organizations,
      bio,
      SSN,
      national_id_image_url
    } = req.body;

    const uploadImg = await cloudinary.uploader.upload(national_id_image_url);
    const imgUrl = uploadImg.url;
    // Ensure required fields are present
    if (!batch_year || !majors || !SSN || !national_id_image_url) {
      throw new ApiError('Missing required fields', httpStatus.status.BAD_REQUEST);
    }

    const newRider = new Rider({
      user: userId,
      batch_year,
      majors,
      monirs,
      club_organizations,
      bio,
      SSN,
      national_id_image_url: imgUrl,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    });

    await newRider.save();

    await User.findByIdAndUpdate(userId, { isDelivery: true });

    return newRider;
  } catch (err) {
    console.error(err);
    throw new ApiError(err.message, httpStatus.status.INTERNAL_SERVER_ERROR);

  }
};


exports.getRandomUnassignedOrder = async (req, res) => {
  const restaurantId = req.user.restaurant;

  try {
    // Find the restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new ApiError('Restaurant not found', httpStatus.NOT_FOUND);
    }

    const coordinates = restaurant.addresses?.coordinates?.coordinates;
    if (!coordinates || coordinates.length !== 2) {
      throw new ApiError('Restaurant coordinates not found or invalid', httpStatus.BAD_REQUEST);
    }

    const [longitude, latitude] = coordinates;
    console.log('Restaurant coordinates:', { longitude, latitude });

    // Fetch up to 5 random unassigned orders for this restaurant
    const orders = await Order.aggregate([
      {
        $match: {
          assigned_to: null,
          restaurant_id: new mongoose.Types.ObjectId(restaurantId),
          status: 'order_prepared',
        }
      },
      { $sample: { size: 5 } }
    ]);

    if (!orders.length) {
      throw new ApiError('No unassigned orders found', httpStatus.NOT_FOUND);
    }

    // Find nearby riders within 20 miles (32.1 km)
    const nearbyRiders = await Rider.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 32186.9 // ~20 miles
        }
      },
      order_accepted: false,
      status: 'active'
    }).select('user');

    console.log('Nearby riders found:', nearbyRiders.length);

    const riderUserIds = nearbyRiders.map(r => r.user);
    const OrderDetails = {
      orders,
      restaurant: {
        name: restaurant.storeName,
        restaurantCoords: coordinates
      }
    }

    // Send the orders to those riders
    await sendOrderToSpecificRiders(riderUserIds, OrderDetails);

    return {
      OrderDetails,
      nearbyRiderUserIds: riderUserIds
    }

  } catch (err) {
    console.error('Error in getRandomUnassignedOrder:', err);
    throw new ApiError('Failed to retrieve orders and riders', httpStatus.INTERNAL_SERVER_ERROR);
  }
};




exports.deliverOrder = async (req, res) => {
  try {
    const { orderId, imageUrl } = req.body;
    let order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', httpStatus.status.NOT_FOUND);
    }
    const rider = await Rider.findOne({ user: req.user.id });
    if (!rider) {
      throw new ApiError('Rider not found', httpStatus.status.NOT_FOUND);
    }
    const uploadImg = await cloudinary.uploader.upload(imageUrl);
    const imgUrl = uploadImg.url;
    order = await patchOrder(orderId, { status: 'delivered', image_url: imgUrl });
    const progress = order.progress;
    const dispatched = progress.find(p => p.status === 'order_dispatched');
    const delivered = progress.find(p => p.status === 'delivered');
    let deliveryDurationHours = 0;
    if (dispatched && delivered) {
      const dispatchedAt = new Date(dispatched.updated_at);
      const deliveredAt = new Date(delivered.updated_at);
      const minutes = differenceInMinutes(deliveredAt, dispatchedAt);
      deliveryDurationHours = minutes / 60;
    }
    const restaurant = await Restaurant.findById(order.restaurant_id);
    if (!restaurant) {
      throw new ApiError('Restaurant not found', httpStatus.status.NOT_FOUND);
    }
    const restaurantCoords = {
      lat: restaurant.addresses.coordinates.coordinates[1],
      lon: restaurant.addresses.coordinates.coordinates[0]
    };
    const userCoords = {
      lat: order.addresses.coordinates.coordinates[1],
      lon: order.addresses.coordinates.coordinates[0]
    };
    const distanceMeters = haversine(restaurantCoords, userCoords);
    const distanceMiles = distanceMeters / 1609.34;
    rider.totalHours = (rider.totalHours || 0) + deliveryDurationHours;
    rider.totalDistance = (rider.totalDistance || 0) + distanceMiles;
    rider.deliveriesCompleted = (rider.deliveriesCompleted || 0) + 1;
    rider.order_accepted = false;
    await order.save();
    await rider.save();
    return {
      order,
      rider
    };
  } catch (err) {
    console.error(err);
    throw new ApiError(err.message, httpStatus.status.INTERNAL_SERVER_ERROR);
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const rider = await Rider.findOne({ user: req.user._id });
    if (!rider) {
      throw new ApiError('Rider not found', httpStatus.status.NOT_FOUND);
    }
    rider.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await rider.save();
    return rider;
  } catch (err) {
    console.error(err);
    throw new ApiError('Failed to update location', httpStatus.status.INTERNAL_SERVER_ERROR);

  }
};

exports.orderAccept = async (req, res) => {
  const { orderId, estimated_time } = req.body;
  const userId = req.user._id;
  try {
    if (!orderId) {
      throw new ApiError("Order ID is required", httpStatus.status.BAD_REQUEST);
    }
    const rider = await Rider.findOne({ "user": userId });
    if (!rider) {
      throw new ApiError("No Rider Found", httpStatus.status.NOT_FOUND);
    }
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError("No Order Found", httpStatus.status.NOT_FOUND);
    }
    if (order.status !== "order_prepared") {
      throw new ApiError("Order is not in a prepared state to be accepted", httpStatus.status.FORBIDDEN)
    }
    order.assigned_to = rider._id;
    order.status = "accepted_by_rider";
    order.estimated_time = estimated_time;
    order.order_accepted = true

    const updatedOrder = await order.save();
    await Conversation.create({
      order: updatedOrder._id,
      customer: updatedOrder.user_id,
      rider: updatedOrder.assigned_to,
    });
    const io = getIO();
    io.to(`order-${order._id}`).emit('order-status-updated', {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      progress: updatedOrder.progress,
      estimated_time: updatedOrder.estimated_time
    });
    let responseOrder = await Order.findById(updatedOrder._id)
      .populate({
        path: 'user_id',
        select: 'firstName lastName imgUrl phoneNumber'
      })
      .populate({
        path: 'restaurant_id',
        select: 'storeName brandName phoneNumber'
      })
      .populate({
        path: 'items.item_id',
        select: 'name price customization sizes'
      });
    responseOrder.items = responseOrder.items.map((item, index) => {
      const originalItem = item.item_id;
      const selectedItem = updatedOrder.items[index];
      const selectedCustomizationIds = selectedItem.customizations.map(id => id.toString());
      const filteredCustomizations = originalItem.customization.filter(cust =>
        selectedCustomizationIds.includes(cust?._id?.toString())
      );
      const filteredSizes = originalItem.sizes.filter(size =>
        size?._id?.toString() === selectedItem?.size?.toString()
      );

      return {
        ...item,
        item_id: {
          ...originalItem,
          customization: filteredCustomizations,
          sizes: filteredSizes
        }
      };
    });
    rider.order_accepted = true;
    await rider.save();
    return responseOrder;
  } catch (err) {
    console.error(err);
    throw new ApiError(`Error in Order Accept: ${err.message}`, httpStatus.status.INTERNAL_SERVER_ERROR);
  }
};
