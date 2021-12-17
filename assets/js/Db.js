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

exports.guildTemplate = {
    id : -1,
    guild : "",
    user_id : "",
    twitch : "",
    date_update : "",
};

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
    let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${FIELD_GUILD} = ? AND ${FIELD_USER} = ?`;
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
