const express = require("express");

const logger = require("morgan");

const cors = require("cors");

module.exports = (app) => {
	app.use(express.json());
	app.use(logger("dev"));
	app.use(
		cors({
			origin: process.env.ORIGIN || "http://localhost:3000",
		})
	);
};
