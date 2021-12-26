require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const btoa = require('btoa');
const utils = require('./Utils');

const CLIENT_ID = process.env.DISCORD_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent('http://localhost:50451/api/discord/callback');

router.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=connections%20identify`);
});

router.get('/callback', utils.catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    console.log(arguments);
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${creds}`,
        },
      });
    const json = await response.json();
    console.log(json);
    res.redirect(`/?token=${json.access_token}`);
  }));

module.exports = router;