'use strict';
const Ticket = require('../models/ticket');
const ApiError = require('../../../../utils/ApiError');
const getAllTickets = async () => {
    try {
        const tickets = await Ticket.find().populate('userId', 'name email');
        return tickets;
    } catch (error) {
        throw new Error('Error fetching tickets: ' + error.message);
    }
};
const createTicket = async (body) => {
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
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
        throw new Error("Ticket not found");
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
        throw new ApiError(404, "Ticket not found");
    }
    return updated;
};
const getTicket = async (id) => {
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
