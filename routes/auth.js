const {Router} = require("express")
const router = Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c92dbf9f51f672",
      pass: "e630410fa1a235"
    }
  });

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        error: req.flash('error'),
        registerError: req.flash('loginError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy( () => {
        res.redirect('/auth/login#login')
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})

        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password)

            if(isSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(e => {
                    if(e) {
                        throw e
                    } else {
                        res.redirect('/')
                    }
                })
            } else {
                req.flash('loginError', 'Неверный пароль')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует')
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body
        const errors = validationResult(req)
        
        if(!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
        
        const hashPassword = await bcrypt.hash(password, 11)
        const user = new User({
            email, name, password: hashPassword, cart: {items: []}
        })  
        await user.save()
        res.redirect('/auth/login#login')
        await transport.sendMail(regEmail(email))
    } catch (e) {
        console.log(e)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, попробуйте позже')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if(candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 3600 * 1000
                await candidate.save()
                res.redirect('/auth/login')
                await transport.sendMail(resetEmail(candidate.email, token))
            } else {
                req.flash('error', 'Такого email не существует')
                return res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', async(req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Восстановить доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }

    } catch (e) {
        console.log(e)
    }
    
})

router.post('/password', async(req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(user) {
            user.password = await bcrypt.hash(req.body.password, 11)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('error', 'Время жизни истекло')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router