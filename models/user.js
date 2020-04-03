const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    _id: Number,
    username: String,
    steamid: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;