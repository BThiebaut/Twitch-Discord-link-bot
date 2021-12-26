const utils = require('./Utils');
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database(__dirname + '/../db/diditwitchdb.db', { verbose: console.log });

const TABLE_NAME = "GUILDS";
const FIELD_GUILD = "GUILD_ID";
const FIELD_USER = "USER_ID";
const FIELD_TWITCH_NAME = "TWITCH_NAME";
const FIELD_DATE_UPDATE = "DATE_UPD";

const TABLE_CONF = "GUILDS_CONFIGS";
const FIELD_CONF_GUILD = "GUILD_ID";
const FIELD_CONF_TWITCH = "TWITCH_CHANNEL";
const FIELD_CONF_ROLE_VIP = "ROLE_VIP";

function createIfNotExists()
{
    let def = `
        (
            ${FIELD_USER} TEXT,
            ${FIELD_GUILD} TEXT NOT NULL,
            ${FIELD_TWITCH_NAME} TEXT NOT NULL,
            ${FIELD_DATE_UPDATE} TEXT,
            PRIMARY KEY (${FIELD_USER}, ${FIELD_GUILD})
        )
    `;
    let sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ${def};`;
    
    db.exec(sql);
}

function createConfIfNotExists()
{
    let def = `
        (
            ${FIELD_CONF_GUILD} TEXT PRIMARY KEY,
            ${FIELD_CONF_ROLE_VIP} TEXT NOT NULL,
            ${FIELD_CONF_TWITCH} TEXT NOT NULL
        )
    `;
    let sql = `CREATE TABLE IF NOT EXISTS ${TABLE_CONF} ${def};`;
    
    db.exec(sql);
}

let createTables = () => {
    createConfIfNotExists();
    createIfNotExists();
}

exports.guildTemplate = {
    user : "",
    guild : "",
    twitch : "",
    date_update : "",
};

exports.confTemplate = {
    guild : "",
    roleVip : "",
    twitchChannel : "",
};

function rowToConf(row){
    let conf = Object.assign({}, exports.confTemplate);
    if (row){
        conf.guild = row[FIELD_CONF_GUILD];
        conf.roleVip = row[FIELD_CONF_ROLE_VIP];
        conf.twitchChannel = row [FIELD_CONF_TWITCH];
    }
    return conf;
}

function rowToGuild(row) 
{
    let guild = Object.assign({}, exports.guildTemplate);
    if (row){
        guild.user = row[FIELD_USER];
        guild.guild = row[FIELD_GUILD];
        guild.twitch = row[FIELD_TWITCH_NAME];
        guild.date_update = row[FIELD_DATE_UPDATE];
    }
    return guild;
}

exports.getGuildMembers = guildId => {
    createTables();

    let guilds = [];

    let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${FIELD_GUILD} = ?`;
    let stmt = db.prepare(sql);
    let rows = stmt.all(guildId);

    for(let row of rows){
        if (row[FIELD_GUILD]){
            let guild = rowToGuild(row);
            guilds.push(guild);
        }
    }

    return guilds;
};

exports.getUser = (guildId, userId) => {
    createTables();
    let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${FIELD_GUILD} = '?' AND ${FIELD_USER} = '?'`;
    let stmt = db.prepare(sql);
    let row = stmt.run(guildId, userId);
    return rowToGuild(row);
};

exports.saveTwitchName = (guildId, userId, twitchName) => {
    createTables();
    
    let date = new Date();
    let strDate = date.getDay() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();

    let sql = `INSERT OR REPLACE INTO ${TABLE_NAME} (${FIELD_USER}, ${FIELD_GUILD}, ${FIELD_TWITCH_NAME}, ${FIELD_DATE_UPDATE}) VALUES (?, ?, ?, ?);`
    let stmt = db.prepare(sql);
    let res = stmt.run(userId, guildId, twitchName, strDate);

    return "Nom twitch ajouté/modifié";
};

let formatRole = role => {
    let regex = /([0-9A-z]+)/;
    let match = role.match(regex);
    
    if (!utils.defined(match[0])){
        throw `Rôle ${role} invalide, utilisez le format @Role`;
    }

    return match[0];
}

exports.setGuildConf = (guildId, roleVip, twitchchannel) => {
    createTables();

    roleVip = formatRole(roleVip);

    let sql = `INSERT OR REPLACE INTO ${TABLE_CONF} (${FIELD_CONF_GUILD}, ${FIELD_CONF_ROLE_VIP}, ${FIELD_CONF_TWITCH}) VALUES(?,?,?);`
    let stmt = db.prepare(sql);
    let res = stmt.run(guildId, roleVip, twitchchannel);
    return "Configuration du serveur mise à jour";
}

exports.getAllGuilds = () => {
    createTables();
    let sql = `SELECT * FROM ${TABLE_CONF}`;
    let stmt = db.prepare(sql);
    let rows = stmt.all();
    let guilds = [];
    for(let row of rows){
        let guild = rowToConf(row);
        if (guild.guild){
            guilds.push(guild);
        }
    }

    return guilds;
};

exports.getGuildConf = guildId => {
    createTables();
    let sql = `SELECT * FROM ${TABLE_CONF} WHERE ${FIELD_CONF_GUILD} = ?`;
    let stmt = db.prepare(sql);
    let row = stmt.get(guildId);
    return rowToConf(row);
};