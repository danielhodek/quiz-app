var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var path = require('path');
var fs = require('fs');
var User = require('../model/user');
var Quiz = require('../model/quiz');
var sharedSession = require('express-socket.io-session');

var rooms = {};

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
			quizId: quiz._id,
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
	let io = req.app.get('io');
	let templates = {};
	templates.template1 = fs.readFileSync(path.join(__dirname, '../views/partials/quiz.ejs'), 'utf-8');

	Quiz.findById(req.session.quizId).populate('author').exec(function(err, quiz) {
		let quizCopy = quiz.toObject();
		let questions = [].concat(quizCopy.questions);
		shuffle(questions);
		for (let question of questions) {
			shuffle(question.answers);
		}
		req.session.questions = questions;

		let quizData = {
			pageTitle: 'Quiz',
			quiz: quiz,
			questions: questions,
			letters: ['a','b','c','d','e','f']			
		}

		if (quiz.author.username === req.session.username) {
			console.log('hello');
			io.emit('new quiz', {
				quiz: quizData.quiz,
				templates: templates
			});
			quizData.author = true;
		} else {
			quizData.author = false;
			io.to('' + req.session.quizId).emit('new user', req.session.username);
		}

		res.render('quiz', quizData);	
	});
});

router.post('/quiz/mark-quiz', function(req, res) {
	let responses = JSON.parse(req.body.responses);
	let questions = req.session.questions;
	let answerKey = getAnswerKey(questions);
	let marks = getMarks(answerKey, responses);	

	return res.status(200).send(marks);
});	

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = a[i];
		a[i] = a[j];
		a[j] = temp;
	}
}	

function getAnswerKey(questions) {
	let answerKey = [];
	for (let question of questions) {
		for (let answer of question.answers) {
			if (answer.correct) {
				answerKey.push(question.answers.indexOf(answer));
			}
		}
	}
	return answerKey;
}

function getMarks(answerKey, responses) {
	let totalQuestions = answerKey.length;
	let correctAnswers = 0;
	
	for (let i = 0; i < answerKey.length; i++) {
		if (answerKey[i] === responses[i]) {
			++correctAnswers;
		}
	}

	let percentage = correctAnswers / totalQuestions * 100;

	return {
		totalQuestions: totalQuestions,
		correctAnswers: correctAnswers,
		percentage: percentage,
		answerKey: answerKey,
		responses: responses
	}
}

module.exports = router;