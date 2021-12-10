const utils = require('./Utils');
const fs = require('fs');
const dbPath = __dirname + '/../db/db.json';

let db = require('./../db/db.json');

const guildTemplate = {
    members : [],
    vips : []
};

exports.save = () => {
    let strDb = JSON.stringify(db, null, 2);
    console.log(strDb);
    fs.writeFile(dbPath, strDb, err => {
        if(err){
            console.error(err);
            return false;
        }
        return true;
    });
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

    return db[id];
};

exports.saveTwitchName = (guildId, discordId, twitchName) => {
    let guild = exports.loadGuild(guildId);
    guild.members.push({
        discordId : twitchName
    });

    if (exports.save()){
        return "Votre pseudo Twitch a bien été enregistré";
    }else {
        return "Une erreur s'est produite";
    }
    
};