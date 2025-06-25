// src/routers/issueRouter.js
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { loggedin, ensureRole } = require('../middlewares/identification');
const { handleValidationErrors } = require('../middlewares/validationHandler');

// Import các validator cần thiết
const {
    validateCreateIssue,
    validateGetAllIssues,
    validateUpdateIssue,
    validateIdInParams
} = require('../validators/issueValidator');

// Customer tạo một sự cố mới
router.post(
    '/',
    loggedin,
    validateCreateIssue,
    handleValidationErrors,
    issueController.createIssue
);

// Customer xem các sự cố của chính mình
router.get(
    '/my-issues',
    loggedin,
    issueController.getMyIssues
);

// Admin lấy tất cả sự cố (có filter và pagination)
router.get(
    '/',
    loggedin,
    ensureRole(['admin']),
    validateGetAllIssues,
    handleValidationErrors,
    issueController.getAllIssues
);

// Cập nhật một sự cố (customer hoặc admin)
router.patch(
    '/:id',
    loggedin,
    validateUpdateIssue,
    handleValidationErrors,
    issueController.updateIssue
);

// Xóa một sự cố (customer hoặc admin)
router.delete(
    '/:id',
    loggedin,
    validateIdInParams,
    handleValidationErrors,
    issueController.deleteIssue
);

module.exports = router;