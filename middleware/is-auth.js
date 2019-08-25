const jwt = require('jsonwebtoken');
const utils = require('../utils/utils');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		throw utils.createError(401, 'Not Authenticated', 'Authorization header missing');
	}

	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, utils.secretKey);
	} catch (err) {
		throw utils.createError(500, 'Token decoding failed', 'jwt malformed');
	}

	if (!decodedToken) {
		throw utils.createError(401, 'Not Authenticated');
	}

	req.userId = decodedToken.userId;
	req.email = decodedToken.email;
	next();
};
