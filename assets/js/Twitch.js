require('dotenv').config();
const tmi = require('tmi.js');
const db = require('./Db');

let isConnected = false;
let client = null;

let createClient = () => {
    if (client == null){
        let channels = [];
        let guilds = db.getAllGuilds();
        for(let guild of guilds){
            channels.push(guild.twitchChannel);
        }

        client = new tmi.Client({
            options: { debug: true, messagesLogLevel: "info" },
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: `${process.env.TWITCH_USERNAME}`,
                password: `oauth:${process.env.TWITCH_OAUTH}`
            },
            channels: channels
        });
    }
}

let registerEvents = () => {
    createClient();
    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        exports.onMessage(message);
    });
    client.on('connected', () => {
        exports.onConnected();
    });
};

let connect = () => {
    createClient();
    return new Promise((resolve, reject) => {
        //if (!isConnected){
            client.once('join', resolve);
            client.connect().catch(reject);
            isConnected = true;
        //}
    });
};

let disconnect = () => {
    createClient();
    return new Promise((resolve, reject) => {
        if (isConnected){
            client.disconnect().catch(reject);
            isConnected = false;
        }
        resolve();
    });
}

exports.onMessage = message => {
    console.log(message);
};

exports.getVips = channel => {
    createClient();
    return new Promise((resolve, reject) => {
        connect().then(() => {
            client.vips(channel).then(resolve, reject);
        }, err => {
            console.error(err);
        })
    });
};

exports.getMods = channel => {
    createClient();
    return new Promise((resolve, reject) => {
        connect().then(() => {
            client.mods(channel).then(resolve, reject);
        }, err => {
            console.error('Get mods error : ', err);
        })
    });
};

exports.onConnected = () => {

};