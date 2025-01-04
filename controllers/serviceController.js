
const Category = require('../models/categoryModel');
const Booking = require('../models/Booking');
const Salon = require('../models/SalonModel');
const Media = require('../models/Media');
const Feedback = require('../models/Feedback');


exports.createCategory = async (req, res) => {
    const salonId = req.userId;

    try {
        const { name, description, price } = req.body;

        if (!name || !price) {
            return res.status(400).send('Name and price is required.');
        }

        const category = new Category({ name, salonId, description, price });
        await category.save();

        res.status(201).send(category);
    } catch (error) {
        res.status(500).send(error.message);
    }
}



exports.getAllcategory = async (req, res) => {
    const salonId = req.userId;
    try {
        const getallcategory = await Category.find({ salonId: salonId });
        res.json(getallcategory);
    } catch (error) {
        return res.status(500).json({ success: false, msg: "error getting category", error: error.message }); // Set status code to 500
    }
}

exports.deleteCategory = async (req, res) => {
    const salonId = req.userId;
    const categoryId = req.params.id;

    try {
        const category = await Category.findOneAndDelete({ _id: categoryId, salonId: salonId });

        if (!category) {
            return res.status(404).json({ success: false, msg: "Category not found or not authorized to delete" });
        }

        res.json({ success: true, msg: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error deleting category", error: error.message });
    }
}


exports.getServicesBySalonId = async (req, res) => {
    try {
        const { id } = req.params;
        const services = await Category.find({ salonId: id });

        if (!services) {
            return res.status(404).json({ message: 'No services found for this salon' });
        }

        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//////////////=======media ======////////////////


exports.uploadMedia = async (req, res) => {
    try {
        const salonId = req.userId;
        console.log('Salon ID:', salonId);
        console.log('Files:', req.files);

        const urls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        if (urls.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const newMedia = new Media({
            salonId,
            url: urls
        });

        const savedMedia = await newMedia.save();
        res.status(201).json(savedMedia);
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
};

exports.getAllMedia = async (req, res) => {
    const salonId = req.userId;

    try {
        const allMedia = await Media.find({ salonId });

        if (!allMedia) {
            return res.status(404).json({ success: false, msg: 'No media found for this salon' });
        }

        res.json(allMedia);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};


exports.deleteMedia = async (req, res) => {
    const { mediaId } = req.params;

    try {

        const deletedMedia = await Media.findOneAndDelete({ _id: mediaId, salonId: req.userId });

        if (!deletedMedia) {
            return res.status(404).json({ success: false, msg: 'Media not found or unauthorized' });
        }

        res.json({ success: true, msg: 'Media deleted successfully', deletedMedia });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
};


exports.getMediaBySalonId = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Media.find({ salonId: id });

        if (!media.length) {
            return res.status(404).json({ message: 'No media found for this salon' });
        }

        res.status(200).json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

//////////====================================book page===========================================





const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${startTime}:00`);
    const endTimeObj = new Date(`1970-01-01T${endTime}:00`);

    while (currentTime < endTimeObj) {
        const nextSlot = new Date(currentTime);
        nextSlot.setHours(currentTime.getHours() + 1);
        slots.push({
            startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: nextSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        currentTime = nextSlot;
    }

    return slots;
};



exports.getServicesAndSlots = async (req, res) => {
    try {
        const { salonId } = req.params;

        // Fetch categories (services) for the given salon
        const categories = await Category.find({ salonId });

        // Fetch the salon to get the start and end times
        const salon = await Salon.findById(salonId);

        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        const startTime = salon.startTime;
        const endTime = salon.endTime;

        // Generate slots based on start and end times
        const slots = generateTimeSlots(startTime, endTime);

        res.json({ services: categories, slots });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


///////////////////////////////================book now ====================================



exports.bookService = async (req, res) => {
    const { userId } = req;
    const { name, email, phone, selectedSlot, selectedService, date } = req.body;
    const { id: salonId } = req.params;

    try {
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        const booking = new Booking({
            userId,
            salonId,
            name,
            email,
            phone,
            selectedSlot,
            selectedService,
            date
        });

        await booking.save();

        res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
        console.error('Error booking:', error);
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation Error', errors: errorMessages });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`Received request to delete appointment with ID: ${id}`);

        const appointment = await Booking.findById(id);
        if (!appointment) {
            console.log('Appointment not found');
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if the user ID from the token matches the userId in the appointment
        console.log(`Appointment found: ${appointment}`);
        if (appointment.userId.toString() !== req.userId) {
            console.log(`Unauthorized: token userId ${req.userId}, appointment userId ${appointment.userId}`);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: 'Appointment cancelled' });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAppointmentsByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await Booking.find({ userId })
            .populate({
                path: 'salonId',
                model: 'Salon',
                select: 'salonName',
            })
            .populate({
                path: 'selectedService',
                model: 'Category',
                select: 'name ',
            });

        if (!appointments) {
            return res.status(404).json({ message: 'No appointments found for this user' });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }

};


exports.getAppointmentsBySalonId = async (req, res) => {
    try {
        const { id } = req.params;
        // const { id } = req.params;
        const appointments = await Booking.find({ salonId: id })
            .populate({
                path: 'userId',
                model: 'User',
                select: 'name email',
            })
            .populate({
                path: 'selectedService',
                model: 'Category',
                select: 'name ',
            });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this salon' });
        }
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


////////////=====================feedback========================

exports.submitFeedback = async (req, res) => {
    const { email, feedback } = req.body;
    const { id: salonId } = req.params;

    try {
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        const newFeedback = new Feedback({
            email,
            feedback,
            salonId
        });

        await newFeedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully', newFeedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReviewsBySalonId = async (req, res) => {
    try {
        const { id: salonId } = req.params;

        const reviews = await Feedback.find({ salonId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

////////========================price compair=====================================



exports.getAllServices = async (req, res) => {
    try {
        const services = await Category.find().populate('salonId', 'salonName');
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.filterServices = async (req, res) => {
    const { serviceName, minPrice, maxPrice } = req.query;

    let query = {};

    if (serviceName) {
        query.name = { $regex: serviceName, $options: 'i' };
    }

    if (minPrice && maxPrice) {
        query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    } else if (minPrice) {
        query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice) {
        query.price = { $lte: parseFloat(maxPrice) };
    }

    try {
        const services = await Category.find(query).populate('salonId', 'salonName');
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
