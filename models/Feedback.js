const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
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
    feedback: {
        type: String,
        required: true,
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
