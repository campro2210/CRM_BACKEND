const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 30
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    hash_password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true,
        max: 12
    },
    sex: {
        type: Number,
        required: true,
    },
    date_of_birth: {
        type: Date
    },
    address: {
        type: String
    },
    userImage: {
        type: String,
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId, ref: "Employee",
        default: null
    },
    role: {
        type: String,
        default: "User"
    }
}, { timestamps: true })

userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

userSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};

module.exports = mongoose.model('Users', userSchema)