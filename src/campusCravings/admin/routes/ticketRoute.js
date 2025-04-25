const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getAllTickets, createTicket, updateTicket, deleteTicket, patchTicket, getTicket, replyticket } = require('../controllers/ticketController');
const { validateBody } = require("../../../../middlewares/validate");
const { updateTicketSchema, createTicketSchema, replyTicketSchema } = require("../validators/ticket");
// Get All Tickets
router.get("/:period", async (req, res) => {
    try {
        const allTickets = await getAllTickets(req, res);
        res.status(httpStatus.status.OK).json({ message: "Tickets Fetch Successfully", tickets: allTickets });
    }
    catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
// Add a new ticket
router.post("/", validateBody(createTicketSchema), async (req, res) => {
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
router.put("/:id", validateBody(updateTicketSchema), async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
// Patch an existing ticket
router.patch("/:id", validateBody(updateTicketSchema), async (req, res) => {
    try {
        const updatedTicket = await patchTicket(req.params.id, req.body);
        return res
            .status(httpStatus.status.OK)
            .json({ message: "Ticket updated successfully", ticket: updatedTicket });
    } catch (error) {
        const status = error instanceof ApiError ? error.statusCode : httpStatus.status.INTERNAL_SERVER_ERROR;
        return res.status(status).json({ message: error.message || "Server Error" });
    }
});
// Get a specific ticket
router.get("/ticketbyid/:id", async (req, res) => {
    try {
        const ticket = await getTicket(req, res);
        res.status(httpStatus.status.OK).json({ message: "Ticket Fetch Successfully", ticket: ticket });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Reply to a ticket
router.patch("/reply/:id", validateBody(replyTicketSchema), async (req, res) => {
    try {
        const updatedTicket = await replyticket(req, res);
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
// fetch all ticket Notification 
module.exports = router;