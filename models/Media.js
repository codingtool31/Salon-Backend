const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
    salonId: { type: String, required: true },
    url: { type: [String], required: true }
});

module.exports = mongoose.model('Media', mediaSchema);
