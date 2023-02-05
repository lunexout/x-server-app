const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

module.exports = async (req, res, next) => {
  try {
    const accessToken = JSON.parse(req.headers.authorization.split(' ')[1])
    if (!accessToken) {
      res.status(401).json({
        code: 401,
        error_code: 'unauthorized',
        message: 'unauthorized',
      })
      next()
    } else {
      const decodedData = jwt.verify(accessToken, env.JWT_KEY)
      req.user = decodedData
      // logger.info(decodedData)
      next()
    }
  } catch (err) {
    res.status(401).json({
      code: 401,
      error_code: 'unauthorized',
      message: 'unauthorized',
    })
  }
}
