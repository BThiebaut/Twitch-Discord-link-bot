const utils = require('./Utils');
const fs = require('fs');
const dbPath = './../db/db.json';

let db = require('./../db/db.json');

const guildTemplate = {
    members : [],
    vips : []
};

exports.save = () => {
    let strDb = JSON.stringify(db, null, 2);
    fs.writeFileSync(dbPath, strDb);
};

exports.decryptDb = () => {
    for(let guild of db){
        // TODO
    }
}

exports.loadGuild = (id) => {

    if (utils.defined(db[id])){
        return db[id];
    }

    db[id] = Object.assign({}, guildTemplate);
    exports.save();

    return db[id];
};

exports.discordToTwitch = (guildId, discordId, twitchName) => {
    let guild = exports.loadGuild(guildId);
    guild.members.push({
        discordId : twitchName
    });

    exports.save();
};