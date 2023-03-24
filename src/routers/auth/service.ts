import { generateTokens } from '@utils/index'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { reissueTokenMiddleware } from '@middleware/index'

import { validate } from '@helpers/index'
import { authValidationSchema } from '@routers/index'

import { UserModel } from '@models/index'

const router = express.Router()

router.route('/').post(validate(authValidationSchema), async (req, res) => {
  const { email, password } = req.body

  UserModel.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, async (_err, verified) => {
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
  .all(reissueTokenMiddleware)
  .post(async (req, res) => {
    const { _id, email, fullName, phone, refreshToken, ...rest } = (req as any)
      .user

    const payload = { _id, email }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_JWT_KEY, {
      expiresIn: '2h',
    })
    res.status(200).json({ email, fullName, phone, accessToken, refreshToken })
  })

export = router
