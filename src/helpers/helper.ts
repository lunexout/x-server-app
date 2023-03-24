import bcrypt from 'bcrypt'
import { ObjectSchema } from 'yup'

export const hashGenerator = (value) => bcrypt.hash(value, 7)

export const validate =
  (schema: ObjectSchema<any>) => async (req, res, next) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (err) {
      return res.status(403).json({
        type: err.name,
        code: 403,
        error_code: err.message.error_code,
        message: err.message.error_message,
      })
    }
  }
