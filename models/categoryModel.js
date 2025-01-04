
const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    salonId: {
        type: Schema.Types.ObjectId,
        ref: 'Salon'
    },
    description: { type: String },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be a positive number'],
        validate: {
            validator: function (value) {

                return !isNaN(value);
            },
            message: 'Price must be a valid number'
        }
    },
});
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
