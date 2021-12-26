
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
    
    app.listen(50451, () => {
      console.info('Running oAuth server on port 50451');
    });

    
    app.use('/api/discord', require('./Api'));
}