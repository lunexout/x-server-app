import express from 'express'
import bcrypt from 'bcrypt'
import { UserModel } from '@models/index'

import { validate } from '@helpers/index'
import { signUpValidationSchema } from '@routers/index'

const router = express.Router()

router.route('/').post(validate(signUpValidationSchema), async (req, res) => {
  const { fullName, email, password } = req.body

  UserModel.findOne({ email }).then((user) => {
    if (user) {
      res.status(409).json({
        error_code: 'email_already_used',
        message: 'Email is already used',
        code: 409,
      })
    } else {
      const hashedPassword = bcrypt.hashSync(password, 12)
      const User = new UserModel({
        fullName,
        email,
        password: hashedPassword,
        phone: '',
      })

      User.save((err) => {
        if (err) {
          res.status(502).json({
            error_code: 'sign_up_failed',
            code: 502,
            message: 'Failed to sign up',
          })
        } else {
          res.status(200).json({})
        }
      })
    }
  })
})

export = router
