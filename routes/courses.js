const {Router} = require("express")
const Course = require('../models/courses')
const User = require("../models/user")
const auth = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')
const {validationResult} = require('express-validator')
const router = Router()

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().lean().populate('userId', 'email name').select('price title img')

        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        }) 
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id/edit', auth, async(req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id)
        console.log(course)
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/courses')
        } 

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult({req})
    const {id} = req.body
    
    if(!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    try {
        delete req.body.id
        const course = await Course.findById(id)
        await Course.findByIdAndUpdate(id, req.body).lean()
    
        if (course.userId.toString() !== req.user._id.toString()) {
            console.log('Вы не владелец курса')
            return res.redirect('/courses')
        }
        

        res.redirect('/courses')   
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean()
        res.render('course', {
            title: `Курс ${course.title}`,
            layout: 'empty',
            course
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        await req.user.removedCourse(req.body.id)
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router