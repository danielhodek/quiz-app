var express = require('express');
var router = express.Router();
var User = require('../model/user');
var bcrypt = require('bcrypt');

router.post('/signup', function(req, res) {
	let userData = {
		name: req.body.name,
		username: req.body.username,
		password: req.body.password
	}

	User.findOne({ username: userData.username }, function(err, user) {
		if (user) {
			return res.send({
				success: false,
				errors: {
					username: 'Username already in use.'
				}
			});
		} else {
			User.create(userData, function(err, user) {
				req.session.userId = user._id;
				req.session.username = user.username;
				req.session.name = user.name;
				return res.send({ success: true });
			});
		}
	});
});

router.post('/login', function(req, res) {
	let userData = {
		username: req.body.username,
		password: req.body.password
	}

	User.findOne({ username: userData.username }, function(err, user) {
		if (user) {
			bcrypt.compare(userData.password, user.password, function(err, result) {
				if (result === true) {
					req.session.userId = user._id;
					req.session.username = user.username;
					req.session.name = user.name;
					res.send({ success: true });
				} else {
					res.send({
						success: false,
						errors: {
							password: 'Password is incorrect.'
						}
					});
				}
			});
		} else {
			res.send({
				success: false,
				errors: {
					username: 'User does not exist.'
				}
			});
		}
	});
});

module.exports = router;
