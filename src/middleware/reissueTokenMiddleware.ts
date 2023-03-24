import jwt from 'jsonwebtoken'
import { UserTokenModel } from '@models/index'

export const reissueTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies['refreshToken']

    if (!refreshToken) {
      res.status(401).json({
        code: 401,
        error_code: 'unauthorized',
        message: 'unauthorized',
      })
    } else {
      UserTokenModel.findOne({ token: refreshToken }, (_err, user) => {
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
            (_err, decoded) => {
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
