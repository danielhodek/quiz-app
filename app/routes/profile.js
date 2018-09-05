var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var path = require('path');
var fs = require('fs');
var User = require('../model/user');
var Quiz = require('../model/quiz');

router.get('/profile', function(req, res) {
	User.findById(req.session.userId, function(err, user) {
		res.render('profile', {
			pageTitle: 'Profile',
			name: user.name,
			links: [
				{ name: 'Logout', href: '/' }
			]
		})
	});
});

router.get('/create', function(req, res) {
	res.render('create', {
		pageTitle: 'Create',
		name: null,
		links: [
			{ name: 'Profile', href: '/profile' },
			{ name: 'Logout', href: '/' }
		]
	});
});

router.post('/create', function(req, res) {
	let quizData = {
		title: req.body.title,
		author: req.session.userId,
		collaborators: [],
		questions: []
	}

	User.findById(req.session.userId).populate('quizzes').exec(function(err, user) {
		for (let quiz of user.quizzes) {
			if (quiz.title == quizData.title) {
				return res.send({
					success: false,
					errors: {
						title: "Quiz name is already taken"
					}
				});
			}
		}
		Quiz.create(quizData, function(err, quiz) {
			user.quizzes.push(quiz._id);
			user.save();
			req.session.quizId = quiz._id;
			return res.send({ success: true });
		});
	});
});

router.get('/view/:quizId', function(req, res) {
	req.session.quizId = req.params.quizId;
	res.redirect('/view');
});

router.get('/view', function(req, res) {
	let templates = {};
	templates.template1 = fs.readFileSync(path.join(__dirname, '../views/partials/answer.ejs'), 'utf-8');
	templates.template2 = fs.readFileSync(path.join(__dirname, '../views/partials/question.ejs'), 'utf-8');
	Quiz.findById(req.session.quizId, function(err, quiz) {
		return res.render('view', {
			pageTitle: 'View Quiz',
			quizTitle: quiz.title,
			questions: quiz.questions,
			name: null,
			links: [
				{ name: 'Profile', href: '/profile' },
				{ name: 'Logout', href: '/' }
			],
			templates: templates
		});
	});
});

router.post('/view/new-question', function(req, res) {
	let questionData = {};
	questionData.text = req.body.question;
	questionData.answers = JSON.parse(req.body.answers);

	Quiz.findById(req.session.quizId, function(err, quiz) {
		let quesitonIndex = quiz.questions.push(questionData) - 1;
		let question = quiz.questions[quesitonIndex];
		quiz.save();
		return res.send(question);
	});
});

router.delete('/view/delete-question/:questionId', function(req, res) {
	Quiz.findById(req.session.quizId, function(err, quiz) {
		quiz.questions.remove(req.params.questionId);
		quiz.save();
		res.sendStatus(200);
	});
});

router.get('/library', function(req, res) {
	User.findById(req.session.userId).populate('quizzes').exec(function(err, user) {
		return res.render('library', {
			pageTitle: 'Library',
			name: user.name,
			quizzes: user.quizzes,
			links: [
				{ name: 'Profile', href: '/profile' },
				{ name: 'Logout', href: '/' }
			]
		});
	});
});

router.get('/quiz/:quizId', function(req, res) {
	req.session.quizId = req.params.quizId;
	res.redirect('/quiz');
});

router.get('/quiz', function(req, res) {
	Quiz.findById(req.session.quizId, function(err, quiz) {
		let quizCopy = quiz.toObject();
		let questions = [].concat(quizCopy.questions);
		shuffle(questions);
		console.log(questions);
		for (let question of questions) {
			shuffle(question.answers);
		}
		req.session.questions = questions;

		res.render('quiz', {
			pageTitle: 'Quiz',
			quiz: quiz,
			questions: questions,
			letters: ['a','b','c','d','e','f']
		});
	});
});

router.post('/quiz', function(req, res) {
	Quiz.findById(req.session.quizId, function(err, quiz) {
		
	});
});

function shuffle(a) {
	for (let i = 0; i < a.length; i++) {
		a[i].index = i;
	}
	for (let i = a.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = a[i];
		a[i] = a[j];
		a[j] = temp;
	}
}	

module.exports = router;