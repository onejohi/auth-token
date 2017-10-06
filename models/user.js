var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    username: String,
    password: String
}, {collection: 'users'});

var User = mongoose.model('User', UserSchema);

module.exports = User;