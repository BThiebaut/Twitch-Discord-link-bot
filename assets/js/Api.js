require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const btoa = require('btoa');
const utils = require('./Utils');
const discord = require('./Discord');
const db = require('./Db');

const CLIENT_ID = process.env.DISCORD_ID;
const CLIENT_SECRET = process.env.DISCORD_SECRET;
const OAUTH_URL = process.env.OAUTH_URL;
const redirect = encodeURIComponent(OAUTH_URL + '/api/discord/callback');

let getTwitchName = async access_token => {


  const responseIdentity = await fetch(`https://discordapp.com/api/users/@me`,
  {
    method: 'GET',
    headers: {'Authorization': `Bearer ${access_token}`}
  });

  const jsonIdentity = await responseIdentity.json();

  const responseGuilds = await fetch(`https://discordapp.com/api/users/@me/guilds`,
  {
    method: 'GET',
    headers: {'Authorization': `Bearer ${access_token}`}
  });

  const jsonGuilds = await responseGuilds.json();

  const response = await fetch(`https://discordapp.com/api/users/@me/connections`,
  {
    method: 'GET',
    headers: {'Authorization': `Bearer ${access_token}`}
  });

  const jsonCOn = await response.json();
  const userId = jsonIdentity.id;
  let twitchName = null;
  for(let con of jsonCOn){
    if (con.type == 'twitch'){
      twitchName = con.name;
      break;
    }
  }

  if (twitchName === null){
    throw "Votre compte discord et twitch doivent être liés";
  }

  // Get guilds of the users and compare with discord api response
  const guilds = db.getAllGuilds();
  let userGuilds = [];
  for(let guild of guilds){
    for(let disc of jsonGuilds){
      if (guild.guild == disc.id){
        userGuilds.push(disc.id);
      }
    }
  }
  
  // Save name to all guilds
  for(let g of userGuilds){
    discord.setOauthTwithName(g, userId, twitchName);
  }
}

router.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=connections%20identify%20guilds`);
});

router.get('/callback', utils.catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    let params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', OAUTH_URL + '/api/discord/callback');
    params.append('scope', 'connections%20identify%20guilds');

    const response = await fetch(`https://discordapp.com/api/oauth2/token`,
      {
        method: 'POST',
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
      });
    const jsonToken = await response.json();
    getTwitchName(jsonToken.access_token);

    res.redirect('/success');
  }));

module.exports = router;