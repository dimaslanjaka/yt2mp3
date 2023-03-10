// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = {
	local: {
		email: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		name: String,
		email: String
	},
	twitter: {
		id: String,
		token: String,
		displayName: String,
		username: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
};

// generating a hash
function genp(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
function decp(inputPassword, savedPassword) {
	return bcrypt.compareSync(inputPassword, savedPassword);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
