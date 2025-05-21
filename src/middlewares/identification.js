const jwt = require('jsonwebtoken');
const user = require('../models/user');

exports.loggedin = (req, res, next) => {
    let token;
    if (req.headers.client === 'not-browser') {
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
            const jwtVerified = jwt.verify(userToken, process.env.JWT_SECRET); // FIXED HERE
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



exports.adminOnly = (req, res, next) => {

    if (req.user && req.user.role === 'admin') {

        next();
    } else {
        res.status(403).json({ 
			success: false, message: 'Admin access only' ,
			userrole: req.user.role,
		});
    }
};