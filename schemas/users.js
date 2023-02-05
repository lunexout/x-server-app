const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const Posts = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
  },
})

const User = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  posts: [Posts],
})

module.exports = mongoose.model('users', User)
