const Issue = require('../models/issue');

exports.getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ user: req.user._id });
        if (!issues || issues.length === 0) {
            return res.status(404).json({ success: false, message: 'No issues found for this user' });
        }
        res.status(200).json({ success: true, data: issues });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getIssueByUserId = async (req, res) => {
    try {
        const issues = await Issue.find({ user: req.params.userId });
        if (!issues || issues.length === 0) {
            return res.status(404).json({ success: false, message: 'No issues found for this user' });
        }
        res.status(200).json({ success: true, data: issues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find();
        res.status(200).json({ success: true, data: issues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createIssue = async (req, res) => {
    try {
        const issue = await Issue.create(req.body);
        res.status(201).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.status(200).json({ success: true, data: issue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.status(200).json({ success: true, message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




