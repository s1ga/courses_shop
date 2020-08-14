const {body} = require('express-validator')
const User = require('../models/user')                                                                

exports.registerValidators = [
    body('email').isEmail().withMessage('Введите корректный email').custom(async (value, {req}) => {
        try {
            const user = await User.findOne({email: value})
            if (user) {
                return Promise.reject('Такой email уже занят')
            }
        } catch (e) {
            console.log(e)
        }
    })
        .normalizeEmail(),
    body('password').isLength({min:8, max: 56}).withMessage('Пароль должен быть минимум 8 символов')
                    .isAlphanumeric().withMessage('Пароль должен содержать буквы и цифры')
                    .trim(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Пароли должны совпадать')
        } else {
            return true
        }
    }).trim(),
    body('name', 'Имя должно быть минимум 3 символа').isLength(2).trim()
]


exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Минимальная длина 3 символа'),
    body('price').isNumeric().withMessage('Введите корректную цену'),
    body('img', 'Введите корректный URL картинки').isURL()
]