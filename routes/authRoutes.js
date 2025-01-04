const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const {
    test,
    signup,
    loginUser,
    registerSalon,
    getUser,
    getAllSalons,
    getSalonProfile,
    getuserlist,
    deleteuser,
    deleteSalon,
    getSalonsByArea,
    submitIssue,
    getAllIssues,
    getsaloninfo

} = require('../controllers/authControllers');


const { authenticateJWT, checkRole } = require('../middleware/roles');
const { createCategory, getAllcategory, deleteCategory, uploadMedia, getServicesBySalonId,
    getMediaBySalonId, getAllMedia, deleteMedia, getServicesAndSlots, bookService,
    getAppointmentsByUserId, deleteAppointment, getAppointmentsBySalonId, submitFeedback,
    getReviewsBySalonId, getAllServices, filterServices } = require('../controllers/serviceController');


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


router.get('/', test);
router.post('/signup', upload.single('profilePicture'), signup);
router.post('/login', loginUser);
router.post('/registerSalon', upload.single('salonPicture'), registerSalon);
router.get('/user', authenticateJWT, getUser);
router.get('/salon/profile', authenticateJWT, checkRole(['salon owner']), getSalonProfile);
router.get('/salons', getAllSalons);
router.get('/issues', getAllIssues);
router.get('/salons/search', getSalonsByArea);
router.get('/get-userlist', getuserlist)
router.delete('/delete-user/:id', deleteuser)
router.delete('/delete-salon/:id', deleteSalon)
//salon routes
router.post('/create-category', authenticateJWT, createCategory)
router.get('/getAllcategory', authenticateJWT, getAllcategory);
router.delete('/delete-category/:id', authenticateJWT, deleteCategory);

//image routes
router.post('/upload', authenticateJWT, upload.array('files', 12), uploadMedia);
router.get('/getAllMedia', authenticateJWT, getAllMedia);
router.delete('/deleteMedia/:mediaId', authenticateJWT, deleteMedia);

//user routes
router.get('/allservices', getAllServices);
router.get('/filter', filterServices);
router.get('/saloninfo/:id', authenticateJWT, getsaloninfo);
router.post('/:id/feedback', authenticateJWT, submitFeedback);
router.get('/:id/reviews', authenticateJWT, getReviewsBySalonId);
router.get('/appointmentSalon/:id', authenticateJWT, getAppointmentsBySalonId);
router.get('/appointments', authenticateJWT, getAppointmentsByUserId);
router.delete('/deleteappointments/:id', authenticateJWT, deleteAppointment);

router.post('/:id/book', authenticateJWT, bookService);
router.get('/:salonId/booking', authenticateJWT, getServicesAndSlots);
router.get('/services/:id', authenticateJWT, getServicesBySalonId);
router.get('/getmediabyId/:id', authenticateJWT, getMediaBySalonId);
router.post('/contact', submitIssue);


router.get('/admin', authenticateJWT, checkRole(['admin']), (req, res) => {
    res.json({ message: 'Welcome, Admin', user: req.user });
});


router.get('/salon-owner', authenticateJWT, checkRole(['salon owner']), (req, res) => {
    res.json({ message: 'Welcome, Salon Owner', user: req.user });
});


router.get('/user', authenticateJWT, checkRole(['user']), (req, res) => {
    res.json({ message: 'Welcome, User', user: req.user });
});

module.exports = router;
