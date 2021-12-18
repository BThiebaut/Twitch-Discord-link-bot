const utils = require('./Utils');
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database(__dirname + '/../db/diditwitchdb.db', { verbose: console.log });

const TABLE_NAME = "GUILDS";
const FIELD_ID = "ID";
const FIELD_GUILD = "GUILD_ID";
const FIELD_USER = "USER_ID";
const FIELD_TWITCH_NAME = "TWITCH_NAME";
const FIELD_DATE_UPDATE = "DATE_UPD";

const TABLE_CONF = "GUILDS_CONFIGS";
const FIELD_CONF_ID = "ID";
const FIELD_CONF_GUILD = "GUILD_ID";
const FIELD_CONF_TWITCH = "TWITCH_CHANNEL";
const FIELD_CONF_ROLE_VIP = "ROLE_VIP";
const FIELD_CONF_ROLE_CMD = "ROLE_CMD";


function createIfNotExists()
{
    let def = `
        (
            ${FIELD_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${FIELD_GUILD} TEXT NOT NULL,
            ${FIELD_USER} TEXT NOT NULL,
            ${FIELD_TWITCH_NAME} TEXT NOT NULL,
            ${FIELD_DATE_UPDATE} TEXT
        )
    `;
    let sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ${def};`;
    
    db.exec(sql);
}

function createConfIfNotExists()
{
    let def = `
        (
            ${FIELD_CONF_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${FIELD_CONF_GUILD} TEXT NOT NULL,
            ${FIELD_CONF_ROLE_VIP} TEXT NOT NULL,
            ${FIELD_CONF_ROLE_CMD} TEXT NOT NULL,
            ${FIELD_CONF_TWITCH} TEXT NOT NULL
        )
    `;
    let sql = `CREATE TABLE IF NOT EXISTS ${TABLE_CONF} ${def};`;
    
    db.exec(sql);
}

exports.guildTemplate = {
    id : -1,
    guild : "",
    user_id : "",
    twitch : "",
    date_update : "",
};

exports.confTemplate = {
    id : -1,
    guild : "",
    roleVip : "",
    roleCmd : "",
    twitchChannel : "",
};

function rowToConf(row){
    let conf = Object.assign({}, exports.confTemplate);
    if (row){
        conf.id = row[FIELD_CONF_ID];
        conf.guild = row[FIELD_CONF_GUILD];
        conf.roleVip = row[FIELD_CONF_ROLE_VIP];
        conf.roleCmd = row[FIELD_CONF_ROLE_CMD];
        conf.twitchChannel = row [FIELD_CONF_TWITCH];
    }
    return conf;
}

function rowToGuild(row) 
{
    let guild = Object.assign({}, exports.guildTemplate);
    if (row){
        guild.id = row[FIELD_ID];
        guild.guild = row[FIELD_GUILD];
        guild.user_id = row[FIELD_USER];
        guild.twitch = row[FIELD_TWITCH_NAME];
        guild.date_update = row[FIELD_DATE_UPDATE];
    }
    return guild;
}

exports.getGuildMembers = guildId => {
    createIfNotExists();

    let guilds = [];

    let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${FIELD_GUILD} = ?`;
    let stmt = db.prepare(sql);
    let rows = stmt.all(guildId);
    
    for(let row of rows){
        if (row.id > -1){
            let guild = rowToGuild(row);
            guilds.push(guild);
        }
    }

    return guilds;
};

exports.getUser = (guildId, userId) => {
    createIfNotExists();
    let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${FIELD_GUILD} = '?' AND ${FIELD_USER} = '?'`;
    let stmt = db.prepare(sql);
    let row = stmt.run(guildId, userId);
    console.log(row);
    return rowToGuild(row);
};

exports.saveTwitchName = (guildId, userId, twitchName) => {
    createIfNotExists();

    /* @var exports.guildTemplate */
    let guild = exports.getUser(guildId, userId);
    console.log(guild);
    let sql = "";
    let date = new Date();
    let strDate = date.getDay() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    // UPDATE CURRENT ENTRY
    if (guild.id > -1){
        sql = `UPDATE ${TABLE_NAME} SET ${FIELD_TWITCH_NAME} = ?, ${FIELD_DATE_UPDATE} = ? WHERE ${FIELD_GUILD} = ? AND ${FIELD_USER} = ?`;
        let stmt = db.prepare(sql);
        let res = stmt.run(twitchName, strDate, guildId, userId);
        return "Nom twitch mis à jour";
    } else {
        // CREATE NEW ENTRY
        sql = `INSERT INTO ${TABLE_NAME} (${FIELD_GUILD}, ${FIELD_USER}, ${FIELD_TWITCH_NAME}, ${FIELD_DATE_UPDATE}) VALUES (?, ?, ?, ?)`;
        let stmt = db.prepare(sql);
        let res = stmt.run(guildId, userId, twitchName, strDate);
    }
    return "Nom twitch ajouté";
};

exports.setGuildConf = (guildId, roleVip, roleCmd, twitchchannel) => {
    createConfIfNotExists();
    let sql = `INSERT OR REPLACE INTO ${TABLE_CONF} (${FIELD_CONF_GUILD}, ${FIELD_CONF_ROLE_VIP}, ${FIELD_CONF_ROLE_CMD}, ${FIELD_CONF_TWITCH}) VALUES(?,?,?,?);`
    let stmt = db.prepare(sql);
    let res = stmt.run(guildId, roleVip, roleCmd, twitchchannel);
    return "Configuration du serveur mise à jour";
}

exports.getAllGuilds = () => {
    let sql = `SELECT * FROM ${TABLE_CONF}`;
    let stmt = db.prepare(sql);
    let rows = stmt.all();
    let guilds = [];
    for(let row of rows){
        let guild = rowToConf(row);
        if (guild.id > -1){
            guilds.push(guild);
        }
    }

    return guilds;
};

exports.getGuildConf = guildId => {
    let sql = `SELECT * FROM ${TABLE_CONF} WHERE ${FIELD_CONF_GUILD} = ?`;
    let stmt = db.prepare(sql);
    let row = stmt.get(guildId);
    return rowToConf(row);
};