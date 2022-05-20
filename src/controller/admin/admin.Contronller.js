const User = require('../../models/user.Model')
const Employee = require('../../models/employee.Model')

const bcrypt = require('bcrypt');
const env = require('dotenv')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const Admin = require('../../models/admin.Model');
const Feedback = require('../../models/feedback.Model')
env.config()
// abc
// Create Admin
exports.createAdmin = async (req, res) => {
    try {
        const adminFind = await Employee.findOne({ email: req.body.email })
        if (adminFind) {
            return res.status(400).json({
                Message: 'Admin already registered'
            })
        } else {
            const password = await bcrypt.hash(req.body.password, 10);
            const newAdmin = new Employee({
                email: req.body.email,
                hash_password: password,
                role: "Admin"
            })
            const saveAdmin = await newAdmin.save()
            res.status(200).json({ saveAdmin })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}

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
            await User.deleteOne({ email: req.body.email })
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
        subject: req.body.title, // Subject line
        text: req.body.message, // plain text body
    }

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            return res.status(500).json({
                error: error
            })
        } else {
            res.status(200).json({
                message: 'Send Mail Successfully'
            })
            await Feedback.findOneAndUpdate({ _id: req.body.id }, { status: 1 })
        }
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

// Create new Employee
exports.createEmployee = async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10);
        const newEmployee = new Employee({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            hash_password: password,
            phone_number: req.body.phone_number,
            room: req.body.room,
            sex: req.body.sex
        })
        const EmployeeSave = await newEmployee.save()
        const { hash_password, ...others } = newEmployee._doc
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json({ error })
    }
}
// Update Employee
exports.updateEmployee = async (req, res) => {
    try {
        const employeeUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone_number: req.body.phone_number,
            room: req.body.room,
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
                data: employee
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

// Delete Employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employeeFind = await Employee.findOne({ email: req.body.email })
        if (employeeFind) {
            await Employee.deleteOne({ _id: employeeFind._id })
            const employee = await Employee.find({})
            res.status(200).json({ Message: "Delete successfully" })
        } else {
            res.status(400).json({
                Message: "Employee not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            errors: error
        })
    }
}

// Get Employee
exports.getEmployee = async (req, res) => {
    try {
        const employeeFind = await Employee.find({}).populate({ path: 'room' })
        if (employeeFind) {
            res.status(200).json({
                Employee: employeeFind
            })
        } else {
            res.status(404).json({
                Message: "Employee not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error
        })
    }
}

// Get Employee by ID
exports.getEmployeeBySlug = async (req, res) => {
    const { slug } = req.params
    try {
        const employeeFind = await Employee.findOne({ _id: slug }).populate({ path: 'room' })
        if (employeeFind) {
            res.status(200).json({
                Employee: employeeFind
            })
        } else {
            res.status(404).json({
                Message: "Employee not Found"
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error
        })
    }
}

exports.getEmployeeByToken = async (req, res) => {
    let token = req.body.token
    if (token) {
        const employee = jwt.verify(token, process.env.SECRET_KEY)
        if (employee) {
            const employeeFind = await Employee.findOne({ _id: employee._id }).populate({ path: "room" })
            if (employeeFind) {
                res.status(200).json({
                    employeeFind
                })
            }
            else {
                res.status(404).json({
                    Message: "Employee not Found"
                })
            }
        }
    }
}

exports.getUserByGender = async (req, res) => {
    try {
        const userMale = await User.find({ sex: 1 })
        const userFemale = await User.find({ sex: 2 })
        if (userMale || userFemale) {
            res.status(200).json({ 
                male: userMale,
                female: userFemale
             })
        } else {
            res.status(400).json({ Message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.getUserCreatedByEmployee = async (req, res) => {
    try {
        const user = await User.find({ employee: { $ne: null } })
        if (user) {
            res.status(200).json({ user })
        } else {
            res.status(400).json({ Message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.getUserCreatedBySelf = async (req, res) => {
    try {
        const user = await User.find({ employee: null })
        if (user) {
            res.status(200).json({ user })
        } else {
            res.status(400).json({ Message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}


exports.getUserByEmployee = async (req, res) => {
    const users = []
    try {
        const user = await User.find({ employee: req.body.employee })
        if (user) {
            res.status(200).json({ user })
        } else {
            res.status(400).json({ Message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
}

// exports.getEmployeeChart = async (req, res) => {
//     try {
//         const employee = await Employee.find({})
//         if (employee) {

//             res.status(200).json({employee._id, email })
//         } else {
//             res.status(400).json({ Message: "Employee not found" })
//         }
//     } catch (error) {
//         res.status(500).json({ error })
//     }
// }

exports.changePassword = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.body.id })
        if (employee) {
            const isPassword = await employee.comparePassword(req.body.oldPassword)
            if (isPassword) {
                if (req.body.password !== null && req.body.password !== "") {
                    const password = await bcrypt.hash(req.body.password, 10);
                    await Employee.findOneAndUpdate({ _id: req.body.id }, { hash_password: password }, { new: true })
                    res.status(200).json({
                        Message: "Update password successfully "
                    })
                } else {
                    res.status(404)
                }
            }
            else {
                res.status(404).json({
                    Message: "Mật khẩu cũ sai"
                })
            }
        }
    } catch (error) {
        res.status(500)
    }
}