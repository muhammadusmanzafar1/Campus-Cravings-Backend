'use strict';
const Ticket = require('../models/ticket');
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');
const cloudinary = require('../../../../utils/cloudinary');
const getAllTickets = async (req) => {
    try {
        const isAdmin = req.user?.isAdmin;
        if (!isAdmin) {
            throw new ApiError('You are not authorized to perform this action', httpStatus.status.UNAUTHORIZED);
        }

        const period = req.params.period || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const now = new Date();
        let match = {};

        switch (period) {
            case 'today':
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                match.createdAt = { $gte: startOfDay };
                break;
            case 'week':
                const day = now.getDay();
                const diffToMonday = day === 0 ? 6 : day - 1;
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - diffToMonday);
                startOfWeek.setHours(0, 0, 0, 0);
                match.createdAt = { $gte: startOfWeek };
                break;
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                match.createdAt = { $gte: startOfMonth };
                break;
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                match.createdAt = { $gte: startOfYear };
                break;
            case 'all':
                break;
            default:
                throw new ApiError('Invalid period', httpStatus.status.BAD_REQUEST);
        }

        const [total, tickets] = await Promise.all([
            Ticket.countDocuments(match),
            Ticket.find(match)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('userId', 'fullName email isCustomer isDelivery isRestaurant')
        ]);

        const formattedTickets = tickets.map(ticket => ({
            id: ticket._id,
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            imgUrls: ticket.imgUrl,
            read: ticket.read,
            user: {
                id: ticket.userId?._id,
                fullName: ticket.userId?.fullName,
                email: ticket.userId?.email,
                role:
                    ticket.userId?.isDelivery
                        ? 'Rider'
                        : ticket.userId?.isCustomer
                            ? 'Customer'
                            : ticket.userId?.isRestaurant
                                ? 'Restaurant'
                                : 'unknown'
            },
            messages: ticket.messages.map(msg => ({
                sender: msg.sender,
                text: msg.text,
                imageUrls: msg.imageUrl.filter(Boolean),
                time: msg.time
            }))
        }));

        return {
            data: formattedTickets,
            pagination: {
                totalPages: Math.ceil(total / limit),
                total,
                currentPage: page,
                pageSize: limit
            }
        };
    } catch (error) {
        throw new ApiError(error.message || 'Internal Server Error', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};


const createTicket = async (req) => {
    const { subject, description, status, priority, imgUrl, messages, read } = req.body;
    const userId = req.user?._id;
    for (let i = 0; i < imgUrl.length; i++) {
        const uploadImg = await cloudinary.uploader.upload(imgUrl[i]);
        imgUrl[i] = uploadImg.url;
    }
    const uploadImgUrl = imgUrl;
    const newTicket = await Ticket.create({
        subject,
        description,
        status,
        priority,
        imgUrl: uploadImgUrl,
        messages,
        userId,
        read
    });
    return newTicket;
};

const updateTicket = async (req) => {
    const userAdmin = req.user?.isAdmin;
    if (!userAdmin) {
        throw new ApiError('You are not authorized to perform this action', httpStatus.status.UNAUTHORIZED);
    }
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedTicket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    return updatedTicket;
};
const deleteTicket = async (id) => {
    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    return deletedTicket;
};
const patchTicket = async (id, updates) => {
    const updated = await Ticket.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    return updated;
};
const getTicket = async (id) => {
    const ticket = await Ticket.findById(id).populate('userId', 'fullName email isCustomer isDelivery isRestaurant');
    if (!ticket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    const user = ticket.userId;
    const role = user?.isDelivery
        ? 'delivery'
        : user?.isCustomer
            ? 'customer'
            : user?.isRestaurant
                ? 'restaurant'
                : 'unknown';

    const response = {
        ...ticket.toObject(),
        userData: {
            fullName: user?.fullName,
            email: user?.email,
            role
        },
        userId: user._id
    };

    return response;
};
const replyticket = async (req) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    const sender = req.user?.isAdmin ? "admin" : "user";
    const { text = '', imageUrl = [] } = req.body;
    for (let i = 0; i < imageUrl.length; i++) {
        const uploadImg = await cloudinary.uploader.upload(imageUrl[i]);
        imageUrl[i] = uploadImg.url;
    }
    const message = {
        sender,
        text,
        imageUrl
    };
    ticket.messages.push(message);
    await ticket.save();
    return ticket;
};

const getNotifications = async ({ page, limit, type }) => {
    const filter = {};
    if (type === "read") filter.read = true;
    else if (type === "unread") filter.read = false;
    const skip = (page - 1) * limit;
    const tickets = await Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "fullName");

    const formatted = tickets.map(t => ({
        ticketId: t._id,
        userFullName: t.userId?.fullName,
        createdAt: t.createdAt,
        status: t.status
    }));
    const total = await Ticket.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
        currentPage: Number(page),
        totalPages,
        totalNotifications: total,
        notifications: formatted
    };
};
module.exports = {
    getAllTickets,
    createTicket,
    updateTicket,
    patchTicket,
    deleteTicket,
    getTicket,
    replyticket,
    getNotifications
};
