let client;
let twitch;

let onVipsResponse = response => {

};

exports.setClient = (bot, oTwitch) => {
    client = bot;
    twitch = oTwitch;
}

exports.onMessage = (message) => {
    if (message == "!syncvips"){
        twitch.getVips(onVipsResponse);
    }
};
