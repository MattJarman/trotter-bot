const mongoose = require('mongoose')
const config = require('./config')
const Bot = require('./src/modules/Bot')

function connect () {
  mongoose.connect(config.mongodb.uri, config.mongodb.options)

  const db = mongoose.connection

  db.once('open', () => {
    console.log('Connected to database.')

    const trotter = new Bot(config.token)
    trotter.listen()
  }).catch((err) => {
    console.error(err)
  })
}

connect()
