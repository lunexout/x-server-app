import { object, string } from 'yup'

export const authValidationSchema = object({
  body: object({
    email: string().email().required(),
    password: string().min(6).required(),
  }),
})
