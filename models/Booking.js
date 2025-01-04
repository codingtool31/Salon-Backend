const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {

                return /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/.test(v);
            },
            message: props => `${props.value} is not a valid email format! Only Gmail, Hotmail, and Yahoo addresses are allowed.`
        }
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const phoneNumberRegex = /^03\d{9}$/;
                if (!phoneNumberRegex.test(v)) {
                    return false;
                }

                const digitCount = {};
                for (let char of v) {
                    if (!digitCount[char]) {
                        digitCount[char] = 1;
                    } else {
                        digitCount[char]++;
                    }
                    if (digitCount[char] > 4) {
                        return false;
                    }
                }
                return true;
            },
            message: props => `${props.value} is not a valid phone number! It should be 11 digits long, start with 03, and each digit can appear at most 4 times.`
        },
    },
    selectedSlot: {
        type: String,
        required: true,
    },
    selectedService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Booking', bookingSchema);

