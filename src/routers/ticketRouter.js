const express = require('express');

const router = express.Router();

const { loggedin, ensureRole } = require('../middlewares/identification');
const ticketController = require('../controllers/ticketController');


router.get('/my-tickets', loggedin, ticketController.getMyTickets);

    
router.get('/user/:userId', loggedin, ticketController.getTicketByUserId);
router.get('/trip/:tripId', loggedin, ticketController.getTicketByTripId);


router.get('/', loggedin, ticketController.getAllTickets);
router.get('/:id', loggedin, ticketController.getTicketById);
router.post('/create-ticket', loggedin, ticketController.createTicket);
router.patch('/:id', loggedin, ticketController.updateTicket);
router.delete('/:id', loggedin, ticketController.deleteTicket);



module.exports = router;