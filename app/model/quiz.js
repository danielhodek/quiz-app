var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const QuizSchema = new Schema({
	title: String,
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	questions: [{
		text: String,
		answers: [{
			text: String,
			correct: Boolean
		}]
	}]
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;