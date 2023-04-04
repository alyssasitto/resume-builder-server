const jsonwebtoken = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
	const token = req.headers.token;

	if (!token) {
		return res.status(400).json({ err: "Token needed for authentication" });
	} else {
		const decoded = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);

		if (!decoded) {
			return res.status(400).json({ err: "Token is not valid" });
		} else {
			req.user = decoded;
		}
	}

	next();
}

module.exports = isAuthenticated;
