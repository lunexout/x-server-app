const jwt = require('jsonwebtoken')
const userTokenSchema = require('../schemas/user-token')

module.exports = async (user) => {
  try {
    const payload = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
    }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_JWT_KEY, {
      expiresIn: '2h',
    })
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_JWT_KEY, {
      expiresIn: '30d',
    })

    const userToken = await userTokenSchema.findOne({ userId: user._id })
    if (userToken) await userToken.remove()

    await new userTokenSchema({ userId: user._id, token: refreshToken }).save()
    return Promise.resolve({ accessToken, refreshToken })
  } catch (err) {
    return Promise.reject(err)
  }
}
