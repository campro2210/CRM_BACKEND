const mongoose = require('mongoose')

const DepartmentSchema = new mongoose.Schema({
    room:{
        type: Number,
        // enum:["Marketing", "CSKH"]
    },
    room_name:{
        type: String
    }
})


module.exports = mongoose.model('Department', DepartmentSchema)