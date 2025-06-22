const express = require('express');
const router = express.Router();



const issueController = require('../controllers/issueController');
const { loggedin, ensureRole } = require('../middlewares/identification');

router.get('/my-issues', loggedin, issueController.getMyIssues);
router.get('/user/:userId', loggedin, issueController.getIssueByUserId);
router.get('/', loggedin, issueController.getAllIssues);
router.get('/:id', loggedin, issueController.getIssueById);
router.post('/', loggedin, ensureRole(['user', 'admin']), issueController.createIssue);
router.patch('/:id', loggedin, ensureRole(['user', 'admin']), issueController.updateIssue);
router.delete('/:id', loggedin, ensureRole(['user', 'admin']), issueController.deleteIssue);


module.exports = router;


