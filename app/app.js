var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

// Database/session modules
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var sharedSession = require('express-socket.io-session');
var User = require('./model/user');
var Quiz = require('./model/quiz');

// Remote
const PORT = process.env.PORT || 8080;
const URL = 'https://dh-quiz-creator.herokuapp.com/';
const MONGODB = 'mongodb://danielhodek:Mecury72@ds249942.mlab.com:49942/quiz';

// Database connection
mongoose.connect(MONGODB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
});

// Session handling
session = session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({
		mongooseConnection: db
	})
});
io.use(sharedSession(session, {
	autoSave: true
}));

// Locals (accesible from templates)
app.locals.url = URL;
app.locals.letters = ['a','b','c','d','e'];

app.set('db', db);
app.set('io', io);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);

// Routes
app.use(require('./routes/authentication'));
app.use(require('./routes/profile'));
app.use(require('./routes/quiz'));

// Error handling
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);	
});

app.get('/', function(req, res) {
	console.log('hello');
	if (req.session) {
		req.session.destroy();
	}
	res.render('index', {
		pageTitle: 'Welcome',
		links: null
	})
});

app.get('/signup', function(req, res) {
	res.render('signup', {
		pageTitle: 'Sign Up'
	});
});

app.get('/login', function(req, res) {
	res.render('login', {
		pageTitle: 'Log In'
	});
});

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.handshake.session.socketId = socket.id;
	socket.handshake.session.save();
	
	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});

	socket.on('join quiz', function() {
		socket.join('' + socket.handshake.session.quizId);
	});

	socket.on('start quiz', function(timeLimit) {
		io.emit('remove quiz', socket.handshake.session.quizId);
		io.to('' + socket.handshake.session.quizId).emit('start quiz', timeLimit);
	});

	socket.on('finish quiz', function(data) {
		data.username = socket.handshake.session.username;
		socket.to('' + socket.handshake.session.quizId).emit('show marks', data);
	});

	socket.on('disconnecting', function() {
		let username = socket.handshake.session.username;
		console.log(socket.handshake.session.quizId);
		Object.keys(socket.rooms).forEach(function(room, idx) {
			if (idx != 0) {
				io.to(room).emit('leave room', username);
			}
		});
	});
});


http.listen(PORT, function() {
	console.log('listening on *:' + PORT);
});
