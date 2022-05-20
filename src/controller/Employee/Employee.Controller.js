const User = require('../../models/user.Model')
const Employee = require('../../models/employee.Model')
const bcrypt = require('bcrypt');
const env = require('dotenv')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const Admin = require('../../models/admin.Model');
env.config()

// Sign In
exports.employeeSignin = async (req, res) => {
    try {
        const employee = await Employee.findOne({ email: req.body.email })
        if (employee) {
            const isPassword = await employee.comparePassword(req.body.password)
            if (isPassword) {
                const token = await jwt.sign({ _id: employee._id, role: employee.role }, process.env.SECRET_KEY, { expiresIn: '2h' })
                res.status(200).json({
                    token,
                    Account: employee
                })
            } else {
                return res.status(404).json({
                    Message: 'Password is Wrong'
                })
            }

        } else {
            return res.status(404).json({
                Message: 'Account is not Found'
            })
        }

    } catch (error) {
        res.status(500).json({ error })
    }
}

// Create Users
exports.createUser = async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            hash_password: password,
            phone_number: req.body.phone_number,
            sex: req.body.sex,
            date_of_birth: req.body.date_of_birth,
            address: req.body.address,
            employee: req.body.employee
        })
        if (req.file) {
            newUser.userImage = req.file.filename
        }
        const userSave = await newUser.save()
        res.status(200).json({
            userSave,
        })
    } catch (error) {
        res.status(500).json({ error })
    }
}

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const userFind = await User.find({ email: req.body.email })
        if (userFind) {
            await User.deleteMany({ _id: userFind._id })
            const user = await User.find({})
            res.status(200).json({ Message: "Delete successfully", user })
        } else {
            res.status(400).json({
                Message: "User not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            errors: error
        })
    }
}

// Update User
exports.updateUser = async (req, res) => {
    try {
        const userUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone_number: req.body.phone_number,
            sex: req.body.sex,
            date_of_birth: req.body.date_of_birth,
            address: req.body.address
        }
        if (req.body.password) {
            const password = await bcrypt.hash(req.body.password, 10);
            userUpdate.hash_password = password
            
        }
        if (req.file) {
            userUpdate.userImage = req.file.filename
        }
        if (req.body.employee) {
            userUpdate.employee = req.body.employee
        }
        const user = await User.findOneAndUpdate({ email: req.body.email }, userUpdate, { new: true })
        if (user) {
            res.status(200).json({
                Message: "Update Successfully",
                UserUpdated: user
            })
        } else {
            res.status(400).json({
                Message: "Update Failure"
            })
        }
    } catch (error) {
        res.status(500).json({ Error: error })
    }

}

// Send Mail to User
exports.employeeSendMail = async (req, res) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'minhhoangv190200@gmail.com', // generated ethereal user
            pass: '39859592aA', // generated ethereal password
        },
    });

    const mailOptions = {
        from: 'minhhoangv190200@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.message, // plain text body
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).json({
                error: error
            })
        }

        res.status(200).json({
            message: 'Send Mail Successfully'
        })
    })
}

// Get User
exports.getUser = async (req, res) => {
    try {
        const userFind = await User.find({}).populate({ path: 'employee' })
        if (userFind) {
            res.status(200).json(userFind)
        } else {
            res.status(404).json({
                Message: "User not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error
        })
    }
}

// Get User by ID
exports.getUserBySlug = async (req, res) => {
    const { slug } = req.params
    try {
        const userFind = await User.findOne({ _id: slug }).populate({ path: 'employee' })
        if (userFind) {
            const { hash_password, ...others } = userFind._doc
            res.status(200).json(others)
        } else {
            res.status(404).json({
                Message: "User not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error
        })
    }
}

// Update Employee Need to Fix
exports.updateEmployee = async (req, res) => {
    try {
        const employeeUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone_number: req.body.phone_number,
            room_name: req.body.room_name,
            sex: req.body.sex

        }
        if (req.body.password) {
            const password = await bcrypt.hash(req.body.password, 10);
            employeeUpdate.hash_password = password
        }
        const employee = await Employee.findOneAndUpdate({ email: req.body.email }, employeeUpdate, { new: true })
        if (employee) {
            res.status(200).json({
                Message: "Update Successfully",
                EmployeeUpdated: employee
            })
        } else {
            res.status(400).json({
                Message: "Update Failure"
            })
        }
    } catch (error) {
        res.status(500).json({ Error: error })
    }
}