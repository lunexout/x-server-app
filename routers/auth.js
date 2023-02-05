const generateTokens = require('../utils/generate-token')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const DateFns = require('date-fns')

const refreshTokenMiddleware = require('../middleware/refreshToken')

const users = require('../schemas/users')

router.route('/').post(async (req, res) => {
  const { email, password } = req.body
  users.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, async (err, verified) => {
        const { accessToken, refreshToken } = await generateTokens(user)

        if (verified) {
          res.status(200).json({
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            accessToken,
            refreshToken,
          })
        } else {
          res.status(403).json({
            error_code: 'invalid_credentials',
            code: 403,
            message: 'Invalid credentials',
          })
        }
      })
    } else {
      res.status(403).json({
        error_code: 'invalid_credentials',
        code: 403,
        message: 'Invalid credentials',
      })
    }
  })
})

router
  .route('/reissue')
  .all(refreshTokenMiddleware)
  .post(async (req, res) => {
    const { _id, email, fullName, phone, refreshToken, ...rest } = req.user
    const payload = { _id, email }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_JWT_KEY, {
      expiresIn: '2h',
    })
    res.status(200).json({ email, fullName, phone, accessToken, refreshToken })
  })

module.exports = router
