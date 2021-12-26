require('dotenv').config();
const tmi = require('tmi.js');
const db = require('./Db');
const utils = require('./Utils');

let isConnected = false;
let client = null;

let createClient = channel => {
    if (client == null){
        let channels = [];
        if (!utils.defined(channel)){
            let guilds = db.getAllGuilds();
            for(let g of guilds){
                channels.push(g.twitchChannel);
            }
        }else {
            channels.push(channel);
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

let connect = channel => {
    createClient(channel);
    return new Promise((resolve, reject) => {
        if (!isConnected){
            client.once('join', resolve);
            client.connect().catch(reject);
            isConnected = true;
        }
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

let deleteClient = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            
            if (client !== null){
                disconnect().then(() => {
                    client = null;
                    resolve();
                }, err => {
                    console.error("deleteClient : " , err);
                    reject();
                })
            }
        }, 2000);
    });
}


exports.onMessage = message => {
    console.log(message);
};

exports.getVips = channel => {
    createClient(channel);
    return new Promise((resolve, reject) => {
        connect().then(() => {
            client.vips(channel).then(resolve, reject);
        }, err => {
            console.error("GetVips error : " , err);
        }).finally(() => {
            deleteClient();
        })
    });
};

exports.getMods = channel => {
    createClient(channel);
    return new Promise((resolve, reject) => {
        connect().then(() => {
            client.mods(channel).then(resolve, reject);
        }, err => {
            console.error('Get mods error : ', err);
        }).finally(() => {
            deleteClient();
        })
    });
};

exports.onConnected = () => {

};