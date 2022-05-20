const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const otpSchema = new mongoose.Schema({
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
        type: String,
    },
    date_of_birth:{
        type: Date
    },
    address:{
        type: String,
        default: ''
    },
    userImage:{
        type: String,
        default: ''
    },
    employee:{
       type: mongoose.Schema.Types.ObjectId, ref: "Employee",
       default: ""
    },
    role:{
        type: String,
        default:"User"
    },
    otp:{
        type: String,
        required: true
    },
    createAt: {type: Date, default: Date.now, index: {expires: 300}}
},{timestamps: true})

otpSchema.methods = {
    compareOtp: async function (otp) {
        return await bcrypt.compare(otp, this.otp);
    },
};

module.exports = mongoose.model('OTP', otpSchema)