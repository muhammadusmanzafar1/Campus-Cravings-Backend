'use strict';
const Ticket = require('../models/ticket');
const ApiError = require('../../../../utils/ApiError');
const getAllTickets = async (req) => {
    try {
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
                throw new Error('Invalid period. Use today, week, month, year, or all.');
        }
        const tickets = await Ticket.find(match).populate('userId', 'name email');
        return tickets;
    } catch (error) {
        throw new Error('Error fetching tickets: ' + error.message);
    }
};

const createTicket = async (body) => {
    // Need to authenticate UserId or get from token to verify
    const { subject, description, userId, status, priority, imgUrl, messages } = body;
    const newTicket = new Ticket({
        subject,
        description,
        userId,
        status,
        priority,
        imgUrl,
        messages,
    });
    await newTicket.save();
    return newTicket;
};

const updateTicket = async (id, body) => {
    // Need to check if the user is the owner of ticket or admin
    const updatedTicket = await Ticket.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
    });

    if (!updatedTicket) {
        throw new Error("Ticket not found");
    }

    return updatedTicket;
};
const deleteTicket = async (id) => {
    // Need to check if the user is the owner of ticket or admin
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
        throw new Error("Ticket not found");
    }

    return deletedTicket;
};
const patchTicket = async (id, updates) => {
    // Need to check if the user is the owner of ticket or admin
    const updated = await Ticket.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw new ApiError(404, "Ticket not found");
    }
    return updated;
};
const getTicket = async (id) => {
    // Need to check if the user is the owner of ticket or admin
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }
    return ticket;
};

module.exports = {
    getAllTickets,
    createTicket,
    updateTicket,
    patchTicket,
    deleteTicket,
    getTicket
};
