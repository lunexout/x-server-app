const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const middleware = require('./middleware/middleware')
const requestIp = require('request-ip')
const connectDatabase = require('./utils/connect-database')
const morganMiddleware = require('./utils/morgan-middleware')
const auth = require('./routers/auth')
const signUp = require('./routers/sign-up')
const bcrypt = require('bcrypt')

require('dotenv').config()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(morganMiddleware)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(requestIp.mw())

connectDatabase()

app.use('/api/auth', auth)
app.use('/api/sign-up', signUp)

// app.use(
//   "/profile",
//   middleware,
//   checkRole([`${role.STUDENT}`, `${role.TEACHER}`]),
//   Profile
// );
// app.use(
//   "/teacher",
//   middleware,
//   checkRole([`${role.TEACHER}`, `${role.ADMIN}`, `${role.ADMINISTRATOR}`]),
//   Teacher
// );
// app.use(
//   "/student",
//   middleware,
//   checkRole([`${role.STUDENT}`, `${role.ADMIN}`, `${role.ADMINISTRATOR}`]),
//   student
// );

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, 'Page not found'))
})

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500).send({ message: res.locals.message })
})

module.exports = app
