const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const csurf = require('csurf')
const flash = require('connect-flash')
const helmet = require('helmet')
const compression = require('compression')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const varMidware = require('./middleware/variables')
const userMidware = require('./middleware/user')
const errorMidware = require('./middleware/error')
const fileMidware = require('./middleware/file')
const keys = require('./keys/index')

const app = express()

const homeRoute = require('./routes/home')
const addRoute = require('./routes/add')
const coursesRoute = require('./routes/courses')
const cardRoute = require('./routes/card')
const ordersRoute = require('./routes/orders')
const authRoute = require('./routes/auth')
const profileRoute = require('./routes/profile')

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
})


const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')


app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({
    extended: true,
}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(fileMidware.single('avatar'))
app.use(csurf())
app.use(flash())
// app.use(helmet())
// app.use(compression())
app.use(varMidware)
app.use(userMidware)


app.use('/', homeRoute)
app.use('/add', addRoute)
app.use('/courses', coursesRoute)
app.use('/card', cardRoute)
app.use('/orders', ordersRoute)
app.use('/auth', authRoute)
app.use('/profile', profileRoute)

app.use(errorMidware)

const PORT = process.env.PORT || 3000

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        app.listen(PORT, () => {
            console.log(`Server listening ${PORT} port`)
        })
    } catch(e) {
        console.log(e)
    }

}


start()