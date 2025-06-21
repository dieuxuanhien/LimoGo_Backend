const jwt = require('jsonwebtoken');
const user = require('../models/user');

exports.loggedin = (req, res, next) => {
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorization'];
    }

    if (!token) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Check for Bearer format
        if (typeof token === 'string' && token.startsWith('Bearer ')) {
            const userToken = token.split(' ')[1];
            const jwtVerified = jwt.verify(userToken, process.env.JWT_SECRET); 
            if (jwtVerified) {
                req.user = jwtVerified;
                next();
            } else {
                throw new Error('Invalid token');
            }
        } else {
            return res.status(403).json({ success: false, message: 'Invalid token format' });
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
};



exports.ensureRole = (roles) => (req, res, next) => {

    if (req.user && roles.includes(req.user.role)) {

        next();
    } else {
        res.status(403).json({
            success: false, message: `${roles.join(', ')} access only`,
            userrole: req.user.role,
        });
    }
};



