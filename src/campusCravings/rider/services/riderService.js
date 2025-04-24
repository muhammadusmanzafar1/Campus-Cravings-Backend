const httpStatus = require('http-status');
const ApiError = require("../../../../utils/ApiError");
const Rider = require('../models/rider');
const Restaurant = require('../../restaurant/models/restaurant')
const User = require('../../../auth/models/user')
const Order = require('../../admin/models/order')
const { differenceInMinutes } = require('date-fns');
const haversine = require('haversine-distance');
const { patchOrder } = require('../../admin/services/order')


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
      national_id_image_url,
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
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError('Latitude and longitude are required', httpStatus.status.BAD_REQUEST);
  }

  try {
    const restaurantIds = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: 32186.9,
          spherical: true
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);

    const nearbyIds = restaurantIds.map(r => r._id);

    const randomOrder = await Order.aggregate([
      {
        $match: {
          assigned_to: null,
          restaurant_id: { $in: nearbyIds }
        }
      },
      { $sample: { size: 1 } },
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurant_id',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      {
        $unwind: '$restaurant'
      }
    ]);

    if (!randomOrder.length) {
      throw new ApiError('No unassigned orders found', httpStatus.status.NOT_FOUND);
    }

    return randomOrder;
  } catch (err) {
    console.error(err);
    throw new ApiError('Failed to retrieve order', httpStatus.status.INTERNAL_SERVER_ERROR);
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
    order = await patchOrder(orderId, { status: 'delivered', image_url: imageUrl });
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
  const { riderId, orderId, estimated_time } = req.body;

  try {
    if (!orderId || !riderId) {
      throw new ApiError("Order ID and Rider ID are required", httpStatus.status.BAD_REQUEST);
    }

    const rider = await Rider.findById(riderId);
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

    order.assigned_to = riderId;
    order.status = "order_dispatched";
    order.estimated_time = estimated_time;
    order.order_accepted = true

    const updatedOrder = await order.save();

    return updatedOrder

  } catch (err) {
    console.error(err);
    throw new ApiError('Failed to update location', httpStatus.status.INTERNAL_SERVER_ERROR);

  }
};
