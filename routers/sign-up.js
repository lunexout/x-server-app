const router = require('express').Router()
const bcrypt = require('bcrypt')
const userSchema = require('../schemas/users')

router.route('/').post(async (req, res) => {
  const { fullName, email, password } = req.body
  userSchema.findOne({ email }).then((user) => {
    if (user) {
      res.status(409).json({
        error_code: 'email_already_used',
        message: 'Email is already used',
        code: 409,
      })
    } else {
      const hashedPassword = bcrypt.hashSync(password, 12)
      const User = new userSchema({
        fullName,
        email,
        password: hashedPassword,
        phone: '',
      })

      User.save((err, response) => {
        console.log(err)
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

module.exports = router
