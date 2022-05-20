const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
// const { default: mongoose } = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        min: 3,
        max: 30,
        default: ""
    },
    lastName: {
        type: String,
        trim: true,
        min: 3,
        max: 30,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        default: ""
    },
    hash_password: {
        type: String,
        required: true,
        default: ""
    },
    phone_number: {
        type: String,
        trim: true,
        max: 12,
        default: ""
    },
    // room_name: {
    //     type: String,
    //     default: ""
    // },
    sex: {
        type: Number
    },
    role: {
        type: String,
        enum: ['Admin', 'Employee'],
        default: "Employee"
    },
    room: {
        type: mongoose.Schema.Types.ObjectId, ref: "Department"
    },
}, { timestamps: true })

employeeSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

employeeSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};

module.exports = mongoose.model('Employee', employeeSchema)