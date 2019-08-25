const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function() {
	it('should throw and error if now authorization header is present', function() {
		const req = {
			get: function() {
				return null;
			}
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not Authenticated');
	});

	it('should throw an error if the authorization header is only one string', function() {
		const req = {
			get: function(headerName) {
				return 'xyz';
			}
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should throw an error if the token cannot be verified', function() {
		const req = {
			get: function(headerName) {
				return 'Bearer xyz';
			}
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should yield a userId after decoding the token', function() {
		const req = {
			get: function(headerName) {
				return 'Bearer sdfqrqwsdr4qrsrt344re';
			}
		};
		sinon.stub(jwt, 'verify');
		jwt.verify.returns({ userId: 'abc', email: 'abc@abc.com' });
    authMiddleware(req, {}, () => {});
    
		expect(req).to.have.property('userId', 'abc');
		expect(req).to.have.property('email', 'abc@abc.com');
    expect(jwt.verify.called).to.be.true;
    
		jwt.verify.restore();
	});
});
