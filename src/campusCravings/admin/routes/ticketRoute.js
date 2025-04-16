const express = require("express");
const httpStatus = require("http-status");
const router = express.Router();
const ApiError = require('../../../../utils/ApiError');
const { getAllTickets, createTicket, updateTicket, deleteTicket } = require('../controllers/ticketController')
// Get All Tickets
router.get("/tickets", async (req, res) => {
    try {
        const allTickets = await getAllTickets(req, res);
        res.status(httpStatus.status.OK).json({ message: "Data Fetch Successfully", tickets: allTickets });
    }
    catch {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
// Add a new ticket
router.post("/tickets", async (req, res) => {
    try {
        const newTicket = await createTicket(req, res);
        res.status(httpStatus.status.CREATED).json({
            message: "Ticket created successfully",
            ticket: newTicket,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Update an existing ticket
router.put("/tickets/:id", async (req, res) => {
    try {
        const updatedTicket = await updateTicket(req, res);
        res.status(httpStatus.status.OK).json({
            message: "Ticket updated successfully",
            ticket: updatedTicket,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Delete a ticket
router.delete("/tickets/:id", async (req, res) => {
    try {
        const deletedTicket = await deleteTicket(req, res);
        res.status(httpStatus.status.OK).json({
            message: "Ticket deleted successfully",
            ticket: deletedTicket,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;