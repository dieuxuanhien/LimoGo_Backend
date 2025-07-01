// src/routers/ticketRouter.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { loggedin, ensureRole } = require('../middlewares/identification');

// Route riêng tư để xem các vé đã đặt của tôi
// GET /api/tickets/my-tickets
router.get('/my-tickets', loggedin, ticketController.getMyTickets);

// === ADMIN ROUTES ===
// Admin get all tickets
router.get('/', loggedin, ensureRole(['admin']), ticketController.getAllTicketsAdmin);

// Admin create ticket
router.post('/', loggedin, ensureRole(['admin']), ticketController.createTicketAdmin);

// Admin get ticket by ID
router.get('/:id', loggedin, ensureRole(['admin']), ticketController.getTicketByIdAdmin);

// Admin update ticket
router.patch('/:id', loggedin, ensureRole(['admin']), ticketController.updateTicketAdmin);

// Admin delete ticket
router.delete('/:id', loggedin, ensureRole(['admin']), ticketController.deleteTicketAdmin);

// Legacy routes (keep for backward compatibility)
router.get('/:userId/tickets', loggedin, ticketController.getTicketByUserId);
router.get('/getAllTickets', loggedin, ticketController.getAllTickets);
router.post('/create-ticket', loggedin, ticketController.createTicket);

module.exports = router;