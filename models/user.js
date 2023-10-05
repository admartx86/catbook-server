const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    realName: String,
    hash: String,
    salt: String,
    email: String
});

module.exports = mongoose.model('User', userSchema);