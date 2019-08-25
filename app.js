const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuid = require('uuid/v4');

const _db = require('./db/database');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const allowedOrigins = ['http://localhost:3000', 'https://s.codepen.io'];

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, uuid() + '-' + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true);
		return;
	}
	cb(null, false);
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form></form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	if (allowedOrigins.includes(req.headers.origin)) {
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	}
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
	console.error('The error is :', error);
	const statusCode = error.statusCode || 500;
	const { message, desc } = error;
	res.status(statusCode).json({ message, desc });
});

_db
	.cassandraConnect(() => {
		const server = app.listen(8080);
		const io = require('./socket').init(server);
		io.on('connection', socket => {
			console.log('Client connected');
		});
	})
	.catch(err => console.log('err :', err));
