const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "Users"
    },
}, { timestamps: true })
module.exports = mongoose.model('Feedbacks', feedbackSchema)