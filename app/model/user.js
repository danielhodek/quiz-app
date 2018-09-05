var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

const UserSchema = new Schema({
	name: String,
	username: String,
	password: String,
	quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz'}],
	friends: [{ type: Schema.Types.ObjectId, ref: 'User'}]
});

UserSchema.pre('save', function(next) {
	let user = this;
	if (!user.isModified('password')) return next();
	return bcrypt.hash(user.password, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
