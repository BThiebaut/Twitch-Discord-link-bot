const utils = require('./Utils');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(__dirname + '/../db/diditwitchdb.db');

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
    
    db.run(sql);
}

exports.guildTemplate = {
    id : -1,
    guild : "",
    user_id : "",
    twitch : "",
    date_update : ""
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
    db.each(sql, [guildId], (err, row) => {
        if (err) {
          throw err;
        }
        let guild = rowToGuild(row);

        if (guild.id > -1){
            guilds.push(rowToGuild(row));
        }
      });
    
    return guilds;
};
