'use strict'
const ticketService = require('../services/ticket')
const asyncHandler = require('express-async-handler');

exports.getAllTickets = asyncHandler(async (req, res) => {
    let tickets = await ticketService.getAllTickets(req);
    return tickets;
});

exports.createTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.createTicket(req.body);
    return ticket;
});

exports.updateTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
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