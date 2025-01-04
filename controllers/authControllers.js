const User = require('../models/UserModel');
const Salon = require('../models/SalonModel');
const Admin = require('../models/AdminModel');
const validateMongoId = require('../middleware/valideID')
const Contact = require('../models/Contactus');




const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../../client/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


exports.test = (req, res) => {
    res.send('Login endpoint working');
};



exports.signup = async (req, res) => {
    const { name, phone, email, password, role } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        if (role === 'customer') {
            const newUser = new User({ name, phone, email, password: hashedPassword, profilePicture });
            await newUser.save();

            res.status(201).json({ message: 'User signed up successfully' });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signup failed' });
    }
};


exports.registerSalon = async (req, res) => {
    const { salonName, email, password, description, phoneNumber, address, selectedArea, startTime, endTime } = req.body;
    const salonPicture = req.file ? `/uploads/${req.file.filename}` : '';

    if (!salonName || !email || !password || !description || !phoneNumber || !address || !selectedArea || !startTime || !endTime) {
        return res.status(400).send('All fields are required');
    }

    try {
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).send('Salon already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const salon = new Salon({ salonName, email, password: hashedPassword, description, phoneNumber, address, selectedArea, startTime, endTime, salonPicture });
        await salon.save();
        res.status(201).send('Salon registered successfully');
    } catch (err) {

        console.error('Error registering salon:', err);
        res.status(500).send(err.message || 'Registration failed');
    }
};

////==================login process==================



exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.error('Email and password are required');
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        let user;
        let role;
        user = await Admin.findOne({ email });
        role = 'admin';
        if (!user) {
            user = await Salon.findOne({ email });
            role = 'salon owner';
        }
        if (!user) {
            user = await User.findOne({ email });
            role = 'user';
        }
        if (!user) {
            console.error('No user found with this email');
            return res.status(404).json({ success: false, message: 'No user found with this email' });
        }

        const isMatch = bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user._id, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ success: true, token: token, role: role, user });
        }
        if (!isMatch) {
            console.error('Invalid email or password');
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};




//============================================getting info =====================================================



exports.getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name,
            phone: user.phone,
            email: user.email,
            profilePicture: user.profilePicture
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAllSalons = async (req, res) => {
    try {
        const salons = await Salon.find();
        res.json(salons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSalonsByArea = async (req, res) => {
    const { area } = req.query;

    try {
        let salons;
        if (area) {

            salons = await Salon.find({ selectedArea: { $regex: new RegExp(area, 'i') } });
        } else {

            salons = await Salon.find();
        }

        res.json(salons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSalonProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const salon = await Salon.findById(userId);

        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


/////===================admin functions============================




exports.getuserlist = async (req, res) => {
    try {
        const getuserlist = await User.find();
        res.json(getuserlist);
    } catch (error) {
        return res.json({ success: false, msg: 'Error fetching user list', error: error.message });
    }
}


exports.deleteuser = async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);

    try {
        const deleteuser = await User.findByIdAndDelete(id);
        if (deleteuser) {
            res.json({ success: true, msg: 'user deleted successfully' });
        } else {
            res.json({ success: false, msg: 'user not found' });
        }
    } catch (error) {
        return res.status(300).json({ success: false, msg: 'internal server error', error: error.message })
    }
}

exports.deleteSalon = async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);

    try {
        const deleteuser = await Salon.findByIdAndDelete(id);
        if (deleteuser) {
            res.json({ success: true, msg: 'user deleted successfully' });
        } else {
            res.json({ success: false, msg: 'user not found' });
        }
    } catch (error) {
        return res.status(300).json({ success: false, msg: 'internal server error', error: error.message })
    }
}


/////==================contact us========================================

exports.submitIssue = async (req, res) => {
    const { email, issue } = req.body;

    if (!email || !issue) {
        return res.status(400).json({ success: false, msg: 'Email and issue are required' });
    }

    try {
        const newContact = new Contact({ email, issue });
        await newContact.save();
        res.status(201).json({ success: true, msg: 'Issue submitted successfully' });
    } catch (error) {
        console.error('Error submitting issue:', error);
        res.status(500).json({ success: false, msg: 'Internal server error', error: error.message });
    }
};
//=======================UserPanel==============================================




exports.getsaloninfo = async (req, res) => {
    try {
        const { id } = req.params;
        const salon = await Salon.findById(id);

        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


///////////////////////================get all issues===============================

exports.getAllIssues = async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};