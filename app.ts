import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import http from 'http'
import requestIp from 'request-ip'
import { dbConnect } from '@utils/index'
import { auth, signUp } from '@routers/index'
import { config } from 'dotenv'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(requestIp.mw())

config()
dbConnect()

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

const server = http.createServer(app)
server.listen(process.env.PORT || 3005, () => {
  console.log(`server start AT ${process.env.PORT}`)
})
