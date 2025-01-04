// models/AdminModel.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
});

adminSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;