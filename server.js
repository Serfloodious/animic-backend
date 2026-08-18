const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config({path: './config/config.env'});

// Connect to database
connectDB();

// Route files
const animes = require('./routes/animes');
const comics = require('./routes/comics');
const auth = require('./routes/auth');

const app = express();

// Body parser
app.use(express.json());

// Sanitize data
app.use((req, res, next) => {
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.params);
    mongoSanitize.sanitize(req.query);
    next();
});

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 1200
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

const allowedOrigins = [
  'https://animic.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/animes', animes);
app.use('/api/v1/comics', comics);
app.use('/api/v1/auth', auth);

// Advanced filtering
app.set('query parser', 'extended');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});