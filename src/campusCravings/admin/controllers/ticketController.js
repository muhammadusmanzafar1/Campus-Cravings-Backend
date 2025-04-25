'use strict'
const ticketService = require('../services/ticket')
const asyncHandler = require('express-async-handler');

exports.getAllTickets = asyncHandler(async (req, res) => {
    let tickets = await ticketService.getAllTickets(req);
    return tickets;
});

exports.createTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.createTicket(req);
    return ticket;
});

exports.updateTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.updateTicket(req);
    return ticket;
});

exports.deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.deleteTicket(req.params.id);
    return ticket;
});

exports.patchTicket = async (id, updates) => {
    const ticket = await ticketService.patchTicket(id, updates);
    return ticket;
};

exports.getTicket = async (req, res) => {
    const ticket = await ticketService.getTicket(req.params.id);
    return ticket;
};

exports.replyticket = async (req, res) => {
    const ticket = await ticketService.replyticket(req);
    return ticket;
};

exports.getNotifications = async (req) => {
    const { page = 1, limit = 10, type } = req.query;
    const data = await ticketService.getNotifications({ page, limit, type });
    return data;
};