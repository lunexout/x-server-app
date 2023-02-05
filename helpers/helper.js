const bcrypt = require('bcrypt')

exports.hashGenerator = (value) => {
  return bcrypt.hash(value, 7)
}
