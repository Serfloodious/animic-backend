const express = require('express');
const dotenv = require('dotenv');

// Route files
const comics = require('./routes/comics');

// Load environment variables from .env file
dotenv.config({path: './config/config.env'});

const app = express();

// Mount routers
app.use('/api/v1/comics', comics);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});