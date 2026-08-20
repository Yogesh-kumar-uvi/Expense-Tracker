const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');

const app = express();


dotenv.config();


// Connect to database
const startServer = async () => {
  try {
    await connectDB();

    // Body parser
    app.use(express.json({ limit: '100kb' }));

    // Cookie parser
    app.use(cookieParser());

    // Sanitize data
    app.use(mongoSanitize());

    // Set security headers
    app.use(helmet());

    // Prevent XSS attacks   
    app.use(xss());

    // Enable CORS — must run before the rate limiter so that even a
    // rate-limited (429) response still carries CORS headers. Otherwise the
    // browser reports a confusing "CORS error" when the real cause is
    // rate-limiting.
    const corsOptions = {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    app.use(cors(corsOptions));

    // Rate limiting — skip OPTIONS entirely (the browser's automatic CORS
    // preflight request shouldn't count against the limit), and use a
    // higher ceiling since a single page load can fire several API calls.

    const limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10 mins
      max: 1000,
      skip: (req) => req.method === 'OPTIONS'
    });
    app.use(limiter);

    // Prevent http param pollution
    app.use(hpp());

    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Routes
    app.use('/api/v1/auth', require('./routes/auth'));
    app.use('/api/v1/users', require('./routes/users'));
    app.use('/api/v1/transactions', require('./routes/transactions'));
    app.use('/api/v1/categories', require('./routes/categories'));
    app.use('/api/v1/budgets', require('./routes/budgets'));
    app.use('/api/v1/goals', require('./routes/goals'));
    app.use('/api/v1/bills', require('./routes/bills'));
    app.use('/api/v1/notifications', require('./routes/notifications'));
    app.use('/api/v1/dashboard', require('./routes/dashboard'));
    app.use('/api/v1/admin', require('./routes/admin'));

    // Centralized error handler must be registered after all routes
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();  