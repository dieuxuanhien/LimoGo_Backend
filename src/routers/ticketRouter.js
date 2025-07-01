// src/routers/ticketRouter.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { loggedin } = require('../middlewares/identification');


// Route riêng tư để xem các vé đã đặt của tôi
// GET /api/tickets/my-tickets
router.get('/my-tickets', loggedin, ticketController.getMyTickets);


router.get('/:userId/tickets', loggedin, ticketController.getTicketByUserId);

router.get('/getAllTickets', loggedin, ticketController.getAllTickets);
router.get('/:id/', loggedin, ticketController.getTicketById);
router.post('/create-ticket', loggedin, ticketController.createTicket);
router.patch('/:id', loggedin, ticketController.updateTicket);
router.delete('/:id', loggedin, ticketController.deleteTicket);


module.exports = router;