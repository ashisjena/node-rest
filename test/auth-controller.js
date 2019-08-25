const expect = require('chai').expect;
const sinon = require('sinon');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

let req, res, user;

describe('Auth Controller - Login', function() {
	before('Initialize the req/res/user', function() {
		req = {
			body: {
				email: 'test@test.com',
				password: 'tester'
			}
		};

		res = {
			statusCode: 500,
			userId: null,
			status(code) {
				this.statusCode = code;
				return this;
			},
			json(data) {
				this.userId = data.userId;
				this['token'] = data.token;
			}
		};

		user = new User('test@test.com', 'tester', 'Ram', 'I am good');
	});

	it('should throw an error if accessing the database fails', function(done) {
		sinon.stub(User, 'findByEmail');
		const error = new Error('This is a dummy error');
		User.findByEmail.rejects(error);

		// for Asynchronous code, make sure to call the `done` function passed as an argument. Or just `return` the promise.
		AuthController.login(req, {}, () => {})
			.then(result => expect(result.desc).eq(error))
			.then(() => User.findByEmail.restore())
			.then(() => done());
	});

	it('should return error when user password does not match', () => {
		sinon.stub(User, 'findByEmail');
		User.findByEmail.resolves(user);

		return AuthController.login(req, {}, () => {})
			.then(error => expect(error.message).eq('Wrong Password'))
			.then(() => User.findByEmail.restore());
	});

	it('should return response status 200 and userId, when the password matches', () => {
		sinon.stub(User, 'findByEmail');
		sinon.stub(bcrypt, 'compare');
		User.findByEmail.resolves(user);
		bcrypt.compare.resolves(true);

		return AuthController.login(req, res, () => {}).then(() => {
			expect(res.statusCode).eq(200);
			expect(res.userId).eq(user.id);
			expect(res).to.have.property('token').not.null;
			User.findByEmail.restore();
			bcrypt.compare.restore();
		});
	});
});
