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

const categoryRoutes = require("./src/campusCravings/restaurant/routes/categoryRoutes")
const restaurantRoute = require("./src/campusCravings/restaurant/routes/restaurantRoutes")
const apiRoutes = require('./src/campusCravings/routes/index')

const app = express();

// Middleware

// sanitize request data
// app.use(mongoSanitize());

// enable cors
const corsOptions = {
  origin: '*', // allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests safely
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

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

// Middleware to log responses
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`Response for ${req.method} ${req.originalUrl}:`, body);
    originalSend.call(this, body);
  };
  next();
});

// Routes 
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to Campus Cravings!");
});

// Convert error to ApiError
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;
