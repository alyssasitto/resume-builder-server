const app = require("express")();

require("./config")(app);

require("dotenv").config();

const authRouter = require("./routes/auth.routes");
app.use("/", authRouter);

module.exports = app;
