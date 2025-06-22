// src/routers/ticketRouter.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { loggedin } = require('../middlewares/identification');


// Route riêng tư để xem các vé đã đặt của tôi
// GET /api/tickets/my-tickets
router.get('/my-tickets', loggedin, ticketController.getMyBookedTickets);


module.exports = router;