const User = require('../../models/user.Model')
const OTP = require('../../models/otp.Model')
const bcrypt = require('bcrypt');
const env = require('dotenv')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const otpGenerator = require('otp-generator');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { createFeedback, findFeedback } = require("../Feedback/Feedback.Controller")
const Feedback = require("../../models/feedback.Model")

// const Feedback = require("../../models/feedback.Model")

env.config()

exports.signup = async (req, res) => {
    try {
        const userFind = await User.findOne({ email: req.body.email })
        if (userFind) {
            return res.status(400).json({
                Message: 'User already registered'
            })
        } else {
            const password = await bcrypt.hash(req.body.password, 10);
            let firstName = req.body.firstName
            let lastName = req.body.lastName
            let email = req.body.email
            let hash_password = password
            let phone_number = req.body.phone_number
            let sex = req.body.sex
            let date_of_birth = req.body.date_of_birth
            let employee = req.body.employee
            let userImage = (req.file) ? req.file.name : ""
            let address = req.body.address
            const newOTP = otpGenerator.generate(6,
                { digits: true, alphabets: false, upperCaseAlphabets: false, specialChars: false }
            )
            const newOtp = new OTP({
                otp: newOTP,
                firstName: firstName,
                lastName: lastName,
                email: email,
                hash_password: hash_password,
                phone_number: phone_number,
                sex: sex,
                date_of_birth: date_of_birth,
                employee: employee,
                userImage: userImage,
                address: address
            })
            const saveOtp = await newOtp.save()
            res.status(200).json({ saveOtp })

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
                subject: "Mail verify  OTP", // Subject line
                text: newOTP, // plain text body
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

    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.verifyOtp = async (req, res) => {
    const otpHolder = await OTP.find({
        email: req.body.email
    })
    if (otpHolder.length === 0) {
        return res.status(400).json({
            Message: "You use an Expired OTP"
        })
    }
    const rightOtpFind = otpHolder[otpHolder.length - 1]
    console.log(rightOtpFind)
    if (rightOtpFind.email == req.body.email && rightOtpFind.otp == req.body.otp) {
        const { otp, ...rest } = rightOtpFind._doc
        const user = new User(rest)
        const saveUser = await user.save()
        if (user) {
            return (res.status(200).json({ saveUser }))
        }
    }
}


exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            const isPassword = await user.comparePassword(req.body.password)
            if (isPassword) {
                const token = await jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '2d' })
                const { _id,
                    firstName,
                    lastName,
                    fullName,
                    email,
                    phone_number,
                    sex,
                    date_of_birth,
                    address,
                    employee,
                    role } = user
                res.status(200).json({
                    token,
                    user: {
                        _id,
                        firstName,
                        lastName,
                        fullName,
                        email,
                        phone_number,
                        sex,
                        date_of_birth,
                        address,
                        employee,
                        role
                    }
                })
            } else {
                return res.status(404).json({
                    Message: 'Password is Wrong'
                })
            }

        } else {
            return res.status(404).json({
                Message: 'User is not Found'
            })
        }

    } catch (error) {
        res.status(500).json({ error })
    }
}

//  Update User Information
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
        } else {
            console.log("none")
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
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.id })
        if (user) {
            const isPassword = await user.comparePassword(req.body.oldPassword)
            if (isPassword) {
                if (req.body.password !== null && req.body.password !== "") {
                    const password = await bcrypt.hash(req.body.password, 10);
                    await User.findOneAndUpdate({ _id: req.body.id }, { hash_password: password }, { new: true })
                    res.status(200).json({
                        Message: "Update password successfully "
                    })
                } else {
                    res.status(404)
                }
            }else{
                res.status(404).json({
                    Message: "Mật khẩu cũ không đúng"
                })
            }
        }
    } catch (error) {
        res.status(500)

    }
}


// User Send Mail
exports.userSendMail = async (req, res) => {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'minhhoangv190200@gmail.com', // generated ethereal user
            pass: '39859592aA', // generated ethereal password
        },
    });

    const mailOptions = {
        from: req.body.email, // sender address
        to: "minhhoangv190200@gmail.com", // list of receivers
        subject: req.body.title, // Subject line
        text: req.body.message, // plain text body
    }

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            return res.status(500).json({
                error: error
            })
        } else {
            try {
                let newFeedback = await new Feedback({
                    email: req.body.email,
                    title: req.body.title,
                    message: req.body.message,
                    user: req.body.user
                })
                if (newFeedback) {
                    await newFeedback.save()
                    res.status(200).json({
                        newFeedback
                    })
                }
            } catch (error) {
                res.status(500).json({
                    Message: error
                })
            }
        }

    })

}
exports.getUser = async (req, res) => {
    let token = req.body.token
    if (token) {
        const user = jwt.verify(token, process.env.SECRET_KEY)
        if (user) {
            const userFind = await User.findOne({ _id: user._id })
            if (userFind) {
                res.status(200).json({
                    user: userFind
                })
            }
            else {
                res.status(404).json({
                    Message: "User not Found"
                })
            }
        }
    }
}

