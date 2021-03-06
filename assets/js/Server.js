
const express = require('express');
const path = require('path');
const app = express();

// Start server
exports.run = () => {
    app.get('/', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '../html/index.html'));
    });

    app.get('/success', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '../html/success.html'));
    });

    app.get('/error', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '../html/error.html'));
    });

    app.listen(2000, () => {
      console.info('Running oAuth server on port 2000');
    });

    
    app.use('/api/discord', require('./Api'));
}