require('dotenv').config();
const tmi = require('tmi.js');

let channel = process.env.TWITCH_CHANNEL;
let isConnected = false;

const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `oauth:${process.env.TWITCH_OAUTH}`
    },
    channels: [`${channel}`]
});

let registerEvents = () => {
    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        exports.onMessage(message);
    });
    client.on('connected', () => {
        exports.onConnected();
    });
};

let connect = () => {
    return new Promise((resolve, reject) => {
        //if (!isConnected){
            client.once('join', resolve);
            client.connect().catch(reject);
            isConnected = true;
        //}
    });
};

let disconnect = () => {
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

exports.getVips = () => {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            client.vips(channel).then(resolve, reject);
        }, err => {
            console.error(err);
        })
    });
};

exports.getMods = () => {
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