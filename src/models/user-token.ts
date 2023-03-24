import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const UserToken = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
})

export const UserTokenModel = mongoose.model('user-token', UserToken)
