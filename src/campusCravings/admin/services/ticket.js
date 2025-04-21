'use strict';
const Ticket = require('../models/ticket');
const ApiError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');
const getAllTickets = async (req) => {
    try {
        const isAdmin = req.user?.isAdmin;
        if (!isAdmin) {
            throw new ApiError('You are not authorized to perform this action', httpStatus.status.UNAUTHORIZED);
        }
        const period = req.params.period || 'all';
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
        const tickets = await Ticket.find(match).populate('userId', 'name email');
        return tickets;
    } catch (error) {
        throw new ApiError(error.message || 'Internal Server Error', httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

const createTicket = async (req) => {
    const { subject, description, status, priority, imgUrl, messages } = req.body;
    const userId = req.user?._id;
    const newTicket = await Ticket.create({
        subject,
        description,
        status,
        priority,
        imgUrl,
        messages,
        userId,
    });
    return newTicket;
};

const updateTicket = async (req) => {
    const userAdmin = req.user?.isAdmin;
    if (!userAdmin) {
        throw new ApiError('You are not authorized to perform this action', httpStatus.status.UNAUTHORIZED);
    }
    const updatedTicket = await Ticket.findByIdAndUpdate(req.id, req.body, {
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
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    return ticket;
};
const replyticket = async (req) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        throw new ApiError("Ticket not found", httpStatus.status.NOT_FOUND);
    }
    const sender = req.user?.isAdmin ? "admin" : "user";
    const { text = '', imageUrl = [] } = req.body;
    const message = {
        sender,
        text,
        imageUrl
    };
    ticket.messages.push(message);
    await ticket.save();
    return ticket;
};

module.exports = {
    getAllTickets,
    createTicket,
    updateTicket,
    patchTicket,
    deleteTicket,
    getTicket,
    replyticket
};
