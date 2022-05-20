const { check, validationResult } = require('express-validator');

exports.validatesSignUpRequest = [
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),

    check('firstName')
    .notEmpty()
    .withMessage('First Name is reqired'),

    check('lastName')
    .notEmpty()
    .withMessage('Last Name is reqired'),

    check('phone_number')
    .notEmpty()
    .isMobilePhone('vi-VN')
    .isLength({min: 10, max: 12})
    .withMessage('Invailid Phone Number'),

    check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 charater long'),

]

exports.validateSignInRequest = [
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),
    check('password')
    .isLength({min : 6})
    .withMessage('Password must be at least 6 charater long'),
]

exports.isRequestValidated = (req, res,next) =>{
    const errors = validationResult(req)
    if(errors.array().length > 0){
        return res.status(400).json({
            errors: errors.array()
        })
    }
    next()
}