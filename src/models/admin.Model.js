const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    hash_password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "Admin"
    }
}, { timestamps: true })

adminSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.hash_password);
    },
};

module.exports = mongoose.model('Admin', adminSchema)