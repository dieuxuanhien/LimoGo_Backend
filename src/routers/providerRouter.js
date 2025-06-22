const express = require('express');
const router = express.Router();

const providerController = require('../controllers/providerController');
const { loggedin, ensureRole } = require('../middlewares/identification');


router.get('/get-provider-current-user', loggedin, ensureRole(['provider']), providerController.getProviderByCurrentUser);
router.patch('/update-provider-current-provider', loggedin, ensureRole(['provider']), providerController.updateProviderByCurrentUser);

router.get('/user/:mainUser', loggedin, ensureRole(['admin']), providerController.getProviderByMainUser);


router.get('/', loggedin, ensureRole(['admin']), providerController.getAllProviders);
router.get('/:id', loggedin, ensureRole(['admin']), providerController.getProviderById);
router.post('/', loggedin, ensureRole(['admin']), providerController.createProvider);
router.patch('/:id', loggedin, ensureRole(['admin']), providerController.updateProvider);
router.delete('/:id', loggedin, ensureRole(['admin']), providerController.deleteProvider);


module.exports = router;