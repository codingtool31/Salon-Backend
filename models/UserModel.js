
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
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
        }
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
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            next(error);
        }
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
