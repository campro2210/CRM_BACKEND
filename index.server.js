const express = require("express");
const app = express()
const env = require('dotenv')
const mongoose = require('mongoose');
const path = require('path')
const http = require("http")
const { Server } = require("socket.io")
const server = http.createServer(app)
app.use("/upload", express.static(path.join(__dirname, "/src/upload")));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methodes: ["GET", "POST"]
    }

})

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})


app.use('/public', express.static(path.join(__dirname, 'uploads')))
const cors = require('cors')

// Fix permission Cors
app.use(cors())


// ************************************************************************************************
// Add headers 
// Fix lỗi Cors
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// ************************************************************************************************

// Config data in env
env.config()
// Use Json in express
app.use(express.json())
// Connect to database
mongoose
    .connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log(console.log(), err));


// routes
const userRoutes = require('./src/routes/user/user')
const adminRoutes = require('./src/routes/admin/admin')


app.use('/api', userRoutes)
app.use('/api', adminRoutes)
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})