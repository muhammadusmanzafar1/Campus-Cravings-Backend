const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { validate } = require('../../../../middlewares/auth');
const { getAllTickets, createTicket, updateTicket, deleteTicket, patchTicket, getTicket } = require('../controllers/ticketController');
const { validateBody } = require("../middlewares/validate");
const { updateTicketSchema, createTicketSchema } = require("../validators/ticket");
// Get All Tickets
router.get("/:period", validate, async (req, res) => {
    try {
        const allTickets = await getAllTickets(req, res);
        res.status(httpStatus.status.OK).json({ message: "Data Fetch Successfully", tickets: allTickets });
    }
    catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
// Add a new ticket
router.post("/", validate, validateBody(createTicketSchema), async (req, res) => {
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
router.put("/:id", validate, validateBody(updateTicketSchema), async (req, res) => {
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
router.delete("/:id", validate, async (req, res) => {
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
router.patch("/:id", validate, validateBody(updateTicketSchema), async (req, res) => {
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
router.get("/ticketbyid/:id", validate, async (req, res) => {
    try {
        const ticket = await getTicket(req, res);
        res.status(httpStatus.status.OK).json({ message: "Data Fetch Successfully", ticket: ticket });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});



module.exports = router;