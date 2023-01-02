const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const logger = require("./logging/logger");
const CONFIG = require("./config/config");
const connectToDb = require("./db/mongodb");

const app = express();

//Routes
const postRouter = require("./routes/posts_routes");

//Connect to MongoDB Database
connectToDb();

//Add Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Security middleware
app.use(helmet());

app.use("/api/v1/posts", postRouter);

app.get("/", (req, res) => {
    res.send("Hello Bloggingapi");
});

//Error handler middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    const errorStatus = err.status || 500
    res.status(errorStatus).send(err.message);

    next();
});

app.listen(CONFIG.PORT, () => {
   logger.info(`Server started on http://localhost:${CONFIG.PORT}`);
});

