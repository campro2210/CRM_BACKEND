const jwt = require('jsonwebtoken')
const env = require('dotenv')
env.config()

exports.requireSignin = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1]
        const user = jwt.verify(token, process.env.SECRET_KEY)
        req.user = user
    } else {
        return res.status(400).json({ message: "Authorization required" })
    }

    next()
}

exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== 'User') {
        return res.status(400).json({ message: "User access denied" })
    }
    next()
}

exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin'){
        return res.status(400).json({ message: "Admin  access denied" })
    }
    next()
}
exports.employeeMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Employee'){
        return res.status(400).json({ message: "Admin  access denied" })
    }
    next()
}