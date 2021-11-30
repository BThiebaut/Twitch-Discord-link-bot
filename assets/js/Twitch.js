require('dotenv').config();

let client;

exports.setClient = bot => {
    client = bot;
}

exports.onMessage = message => {
    console.log(message);
};

exports.getVips = callback => {
    client.vips(process.env.TWITCH_CHANNEL)
    .then(callback(response), err => {
        console.error(err);
    });
};

exports.getMods = callback => {
    client.mods(process.env.TWITCH_CHANNEL)
    .then(callback(response), err => {
        console.error(err);
    });
};