const router = require("express").Router();
const db = require("../db");

const jwt = require("jsonwebtoken");

const bcryptjs = require("bcryptjs");

const isAuthenticated = require("../middlewares/jwt.middleware");

// Signup route
router.post("/signup", (req, res) => {
	const { name, email, password } = req.body;

	if (name === "" || email === "" || password === "") {
		return res
			.status(400)
			.json({ err: "Please add a name, email, and password" });
	}

	const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ err: "Please enter a valid email" });
	}

	if (password.length < 8) {
		return res.status(400).json({
			err: "Password must be at least 8 characters long",
		});
	}

	db.query("SELECT * FROM users WHERE email = ?", email, (err, result) => {
		if (err) {
			return res.status(500).json({ err: "Server error" });
		} else {
			if (result.length > 0) {
				return res.status(400).json({ err: "User already exists" });
			} else {
				const salt = bcryptjs.genSaltSync(10);
				const hashedPassword = bcryptjs.hashSync(password, salt);

				db.query(
					"INSERT INTO users (name, email, password) VALUES(?,?,?)",
					[name, email, hashedPassword],
					(err, result) => {
						if (err) {
							return res.status(500).json({ err: "Could not create user" });
						} else {
							const payload = {
								name,
								email,
							};

							const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
								algorithm: "HS256",
								expiresIn: "1h",
							});

							const refresh_token = jwt.sign(
								payload,
								process.env.TOKEN_SECRET,
								{
									algorithm: "HS256",
									expiresIn: "1d",
								}
							);

							return res.status(200).json({ token, refresh_token });
						}
					}
				);
			}
		}
	});
});

// Login route
router.post("/login", (req, res) => {
	const { email, password } = req.body;

	if (email === "" || password === "") {
		return res.status(400).json({ err: "Please enter an email and password" });
	}

	db.query("SELECT * FROM users WHERE email = ?", email, (err, result) => {
		if (result.length === 0) {
			return res.status(400).json({ err: "Invalid credentials" });
		} else if (result.length > 0) {
			const passwordsMatch = bcryptjs.compareSync(password, result[0].password);

			if (!passwordsMatch) {
				return res.status(400).json({ err: "Invalid credentials" });
			} else {
				const payload = {
					name: result[0].name,
					email: result[0].password,
				};

				const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
					algorithm: "HS256",
					expiresIn: "1h",
				});

				const refresh_token = jwt.sign(payload, process.env.TOKEN_SECRET, {
					algorithm: "HS256",
					expiresIn: "1d",
				});

				return res.status(200).json({ token, refresh_token });
			}
		} else {
			return res.status(500).json({ err: "Server error" });
		}
	});
});

router.get("/verify", isAuthenticated, (req, res) => {
	res.status(200).json(req.user);
});

module.exports = router;
