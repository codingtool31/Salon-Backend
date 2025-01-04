

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Admin = require('../models/AdminModel');
const Salon = require('../models/SalonModel');

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            req.role = decoded.role;
            next();
        } catch (err) {
            console.error('JWT verification failed:', err.message);
            res.sendStatus(403);
        }
    }
    if (!token) {
        console.error('Authorization token missing');
        return res.sendStatus(403);
    }


};

const checkRole = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) {
        throw new Error('Invalid roles array');
    }

    return async (req, res, next) => {
        try {
            let user;

            switch (req.role) {
                case 'admin':
                    user = await Admin.findById(req.userId);
                    break;
                case 'salon owner':
                    user = await Salon.findById(req.userId);
                    break;
                case 'user':
                    user = await User.findById(req.userId);
                    break;
                default:
                    console.error('Invalid role:', req.role);
                    return res.status(403).json({ message: 'Access denied' });
            }

            if (!user) {
                console.error('User not found with ID:', req.userId);
                return res.status(404).json({ message: 'User not found' });
            }

            if (!roles.includes(req.role)) {
                console.error('User role not authorized:', req.role);
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (err) {
            console.error('Role check failed:', err.message, err.stack);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    };
};

module.exports = { authenticateJWT, checkRole };
