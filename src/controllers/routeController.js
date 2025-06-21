
const Route = require('../models/route');




exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate('origin_station_id', '-_id name').populate('destination_station_id', '-_id name');
        res.status(200).json(routes);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('origin_station_id', '-_id name').populate('destination_station_id', '-_id name');
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json(route);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json(route);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json(route);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndRemove(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json({ message: 'Route deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
