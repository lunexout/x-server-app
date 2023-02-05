const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const cookieParser = require('cookie-parser')
const userTokenSchema = require('../schemas/user-token')

module.exports = async (req, res, next) => {
  try {
    const refreshToken = req.cookies['refreshToken']
    if (!refreshToken) {
      res.status(401).json({
        code: 401,
        error_code: 'unauthorized',
        message: 'unauthorized',
      })
    } else {
      userTokenSchema.findOne({ token: refreshToken }, (err, user) => {
        if (!user) {
          res.status(401).json({
            code: 401,
            error_code: 'unauthorized',
            message: 'unauthorized',
          })
        } else {
          jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_JWT_KEY,
            (err, decoded) => {
              if (decoded) {
                req.user = { ...decoded, refreshToken }
                next()
              } else {
                res.status(401).json({
                  code: 401,
                  error_code: 'unauthorized',
                  message: 'unauthorized',
                })
              }
            },
          )
        }
      })
    }
  } catch (err) {
    res.status(401).json({
      code: 401,
      error_code: 'unauthorized',
      message: 'unauthorized',
    })
  }
}
