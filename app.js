require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');
const Bot = require('./modules/Bot');

let trotter = new Bot(config.token);

function connect() {
  mongoose.connect(config.mongodb.uri, config.mongodb.options);

  let db = mongoose.connection;

  db.once('open', () => {
    console.log('Connected to database.');
    trotter.listen();
  }).catch((err) => {
    console.error(err);
  });
}

connect();
