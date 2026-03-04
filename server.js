const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({path: './config/config.env'});

const app = express();

app.get('/api/v1/comics', (req, res) => {
    res.status(200).json({
        success: true,
        msg: 'Show all comics'
    });
});

app.get('/api/v1/comics/:id', (req, res) => {
    res.status(200).json({
        success: true,
        msg: `Show comic with id ${req.params.id}`
    });
});

app.post('/api/v1/comics', (req, res) => {
    res.status(201).json({
        success: true,
        msg: 'Create new comic'
    });
});

app.put('/api/v1/comics/:id', (req, res) => {
    res.status(200).json({
        success: true,
        msg: `Update comic with id ${req.params.id}`
    });
});

app.delete('/api/v1/comics/:id', (req, res) => {
    res.status(200).json({
        success: true,
        msg: `Delete comic with id ${req.params.id}`
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});