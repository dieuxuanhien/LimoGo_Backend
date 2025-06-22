
const Route = require('../models/route');




exports.getAllRoutes = async (req, res) => {
    filter = {};
    if (req.query.originStation) filter.originStation = req.query.originStation
    if (req.query.destinationStation) filter.destinationStation = req.query.destinationStation;
    if (req.query.estimatedDurationMin) filter.estimatedDurationMin = req.query.estimatedDurationMin;
    if (req.query.distance) filter.distance = req.query.distance;
    try {
        const routes = await Route.find(filter).populate('originStation', '-_id name city country').populate('destinationStation', '-_id name city country');
        res.status(200).json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('originStation', '-_id name city country ').populate('destinationStation', '-_id name city country ');
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json(route);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json(route);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json(route);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndRemove(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json({ message: 'Route deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
