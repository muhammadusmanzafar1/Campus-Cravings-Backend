require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { errorConverter, errorHandler } = require('./middlewares/error');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const upload = multer({ storage: multer.memoryStorage() });
const helmet = require("helmet");
const compression = require("compression");

const app = express();

app.use(function (err, req, res, next) {
    if (err) {
        (res.log).error(err.stack);
        if (req.xhr) {
            res.send(500, { error: 'Something went wrong!' });
        } else {
            next(err);
        }

        return;
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Middleware

// sanitize request data
// app.use(mongoSanitize());

// enable cors
app.use(cors('*'));
// app.options('*', cors());

//media Uploads
app.use(upload.any());

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(helmet());

// cookie parser
app.use(cookieParser());

app.use(compression());

// Routes
// app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./src/auth/routes/authRoute"));
app.use("/api/admin", require("./src/campusCravings/admin/routes/adminRoute"));

// convert error to CustomError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Welcome to SocialHype!");
});

module.exports = app;
