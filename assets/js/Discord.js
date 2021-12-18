require('dotenv').config();
const twitch = require('./Twitch');
const db = require('./Db');
const { Permissions } = require('discord.js');
const utils = require('./../js/Utils');

let client;

let onVipsResponse = (vipList, guild) => {
    let list = client.guilds.cache.get(`${process.env.DISCORD_GUILD_ID}`);
    let members = [];
    list.members.cache.forEach(member => { members.push(member) }); 
    console.log(members);
    console.log(vipList);
};

let setTwitchName = interaction => {
    let guild = interaction.guildId;
    let user = interaction.user.id;
    let twitchName = interaction.options.getString('pseudo');
    try {
        let response = db.saveTwitchName(guild, user, twitchName);
        interaction.reply(response);
    }catch(e){
        interaction.reply("Une erreur s'est produite : " + e);
    }
};

exports.commands = [
    {
        name: "vipsync",
        description: "Sync role vip, nécessite d'être en diffusion" 
    },
    {
        name: "twitchname",
        description: "Renseigne ton pseudo sur twitch pour synchroniser ton vip",
        options : [
            {
                name : "pseudo",
                description : "Ton pseudo twitch",
                type : 3,
                required : true

            }
        ]
    },
    {
        name: "guildconfig",
        description : "Configure le bot, Admin uniquement",
        options : [
            {
                name : "rolevip",
                description : "Role VIP a assigner (ex : @VIP)",
                type : 3,
                required: true
            },
            {
                name : "rolecmd",
                description : "Role pouvant effectuer la synchronisation manuelle (ex : @Moderateurs)",
                type : 3,
                required: true
            },
            {
                name : "twitchchannel",
                description : "Chaîne twitch à synchroniser",
                type : 3,
                required: true
            }
        ]
    }
];

exports.setClient = (bot) => {
    client = bot;
}

exports.onMessage = message => {
    
};

exports.updateVips = (channel, guild) => {
    twitch.getVips(channel).then(list => onVipsResponse(list, guild), console.error);
}

exports.updateAllVips = () => {
    let guilds = db.getAllGuilds();
    for(let guild of guilds){
        twitch.getVips(guild.twitchChannel).then(list => onVipsResponse(list, guild), console.error);
    }
}

exports.onInteraction = interaction => {
    try {
        if (interaction.commandName === 'vipsync' && interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){

            let guild = db.getGuildConf(interaction.guildId);
            if (guild.id == -1){
                throw "Cette guilde n'existe pas ou n'a pas été configurée";
            }
            exports.updateVips(guild.twitchChannel, guild);
            interaction.reply('La synchronisation des VIPs a bien été initialisée');
        }else if (interaction.commandName === 'guildconfig' && interaction.member.permissions.has(Permissions.ALL)){
            let discordId = interaction.guildId;
            let roleVip = interaction.options.getString('rolevip');
            let roleCmd = interaction.options.getString('rolecmd');
            let twitchchannel = interaction.options.getString('twitchchannel');
    
            db.setGuildConf(discordId, roleVip, roleCmd, twitchchannel);
        
        }else if (interaction.commandName === 'twitchname'){
            setTwitchName(interaction);
        }
    }catch(e){
        console.error(e);
        interaction.reply("Une erreur s'est produite : " + e);
    }
}