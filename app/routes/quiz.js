var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var path = require('path');
var fs = require('fs');
var User = require('../model/user');
var Quiz = require('../model/quiz');
var sharedSession = require('express-socket.io-session');

router.get('/quiz/:quizId', function(req, res) {
	req.session.quizId = req.params.quizId;
	res.redirect('/quiz');
});

router.get('/quiz', function(req, res) {
	let io = req.app.get('io');
	let templates = {};
	templates.template1 = fs.readFileSync(path.join(__dirname, '../views/partials/quiz.ejs'), 'utf-8');

	Quiz.findById(req.session.quizId).populate('author').exec(function(err, quiz) {
		let quizData = {
			pageTitle: 'Quiz',
			quiz: quiz	
		}

		if (req.session.userId == quiz.author._id) {
			quizData.author = true;
		} else {
			quizData.author = false;
			io.emit('new user', req.session.username);
		}

		let questions = [].concat(quiz.toObject().questions);

		for (let question of questions) {
			shuffle(question.answers);
		}

		shuffle(questions);
		req.session.questions = questions;
		quizData.questions = questions;

		if (quizData.author) {
			io.emit('new quiz', {
				quiz: quizData.quiz,
				templates: templates
			});
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