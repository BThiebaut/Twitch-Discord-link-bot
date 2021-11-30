require('dotenv').config();
const tmi = require('tmi.js');
const didi = require('discord.js');
const twitch = require('./assets/js/Twitch');
const discord = require('./assets/js/Discord');

// Connect twitch bot
const twitchClient = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `oauth:${process.env.TWITCH_OAUTH}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

twitchClient.connect().catch(console.error);

twitchClient.on('connected', () => {
    twitch.setClient(twitchClient);
    setTimeout(() => {
        twitch.getVips(response => {
            console.log(response);
        });
    }, 2000)
})

twitchClient.on('message', (channel, tags, message, self) => {
    //if (self) return;
    twitch.onMessage(message);
});

// Connect Discord bot
/*
const discordClient = new didi.Client();

discordClient.on('ready', function () {
    discord.setClient(discordClient, twitch);
});

discordClient.login(`${process.env.DISCORD_TOKEN}`);

discordClient.on('message', message => {
    discord.onMessage(message);
})
*/