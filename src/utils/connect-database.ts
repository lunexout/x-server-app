import mongoose from 'mongoose'

export const dbConnect = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions

  mongoose.set('strictQuery', false)
  mongoose.connect(process.env.DATABASE_URL, connectionParams)

  mongoose.connection.on('connected', () => {
    console.log('Connected to database sucessfully')
  })

  mongoose.connection.on('error', (err) => {
    console.log('Error while connecting to database :' + err)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('Mongodb connection disconnected')
  })
}
