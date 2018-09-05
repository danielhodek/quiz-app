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

const PORT = 3000;

mongoose.connect('mongodb://localhost/quiz');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
});

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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);

app.use(require('./routes/authenticate'));
app.use(require('./routes/profile'));
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);	
});

app.get('/', function(req, res) {
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
});

http.listen(PORT, function() {
	console.log('listening on *:3000');
});
