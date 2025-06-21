const express = require('express');
const router = express.Router();

const routeController = require('../controllers/routeController');

const { loggedin, ensureRole } = require('../middlewares/identification');

//router.get('/search', loggedin, routeController.searchRoutes);
router.get('/', loggedin, routeController.getAllRoutes);
router.get('/:id', loggedin, routeController.getRouteById);
router.post('/create-route', loggedin, ensureRole(['admin']), routeController.createRoute);
router.patch('/:id', loggedin, ensureRole(['admin']), routeController.updateRoute);
router.delete('/:id', loggedin, ensureRole(['admin']), routeController.deleteRoute);

module.exports = router;