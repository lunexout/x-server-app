import { object, string } from 'yup'

export const signUpValidationSchema = object({
  body: object({
    email: string()
      .email({
        error_code: 'email_format',
        error_message: 'Invalid email format',
      })
      .required({
        error_code: 'email_is_required',
        error_message: 'Email is required',
      }),
    password: string()
      .min(6, {
        error_code: 'minimum_password',
        error_message: 'Password length must be 6',
      })
      .required({
        error_code: 'password_is_required',
        error_message: 'Password is required',
      }),
    fullName: string().required({
      error_code: 'full_name_is_required',
      error_message: 'Full name is required',
    }),
  }),
})
