require('dotenv').config();
const twitch = require('./Twitch');
const db = require('./Db');
const { Permissions } = require('discord.js');
const utils = require('./../js/Utils');

let client;

let onVipsResponse = (vipList, guild) => {
    let guildData = client.guilds.cache.get(guild.guild);
    guildData.members.fetch().then(r => {
        let members = [];
        guildData.members.cache.forEach(member => { members.push(member) }); 
        
        let role = guildData.roles.cache.find(r => r.id === guild.roleVip);
        let twitchNames = db.getGuildMembers(guild.guild);
        
    
        for(let member of members){
            // Remove role if not vip
            member.roles.remove(role);
            let data = twitchNames.find(e => e.user == member.id);
            if (utils.defined(data)){
                let vip = vipList.find(e => data.twitch == e);
                // Add role if in vip list
                if (utils.defined(vip)){
                    member.roles.add(role);
                }
            }
    
        }
    })

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

exports.setOauthTwithName = (guildId, userId, name) => {
    db.saveTwitchName(guildId, userId, name);
};

exports.commands = [
    {
        name: "vipsync",
        description: "Sync role vip, nécessite d'être en diffusion" 
    },
    {
        name: "settwitchname",
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
    console.log("Update guild : " + guild.guild);
    twitch.getVips(channel).then(list => onVipsResponse(list, guild), console.error);
}

let sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.updateAllVips = async () => {
    let guilds = db.getAllGuilds();
    for (let guild of guilds){
        exports.updateVips(guild.twitchChannel, guild);
        await sleep(10000);
    }
}

exports.onInteraction = interaction => {
    try {
        if (interaction.commandName === 'vipsync' && interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)){

            let guild = db.getGuildConf(interaction.guildId);
            if (guild.id == -1){
                throw "Cette guilde n'existe pas ou n'a pas été configurée";
            }
            exports.updateVips(guild.twitchChannel, guild);
            interaction.reply('La synchronisation des VIPs a bien été initialisée');
        }else if (interaction.commandName === 'guildconfig' && interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)){
            let discordId = interaction.guildId;
            let roleVip = interaction.options.getString('rolevip');
            let twitchchannel = interaction.options.getString('twitchchannel');
    
            db.setGuildConf(discordId, roleVip, twitchchannel);
            interaction.reply("Configuration discord/twitch enregistrée");
        
        }else if (interaction.commandName === 'settwitchname'){
            setTwitchName(interaction);
        }else {
            interaction.reply("Droits insuffisant pour effectuer cette commande");
        }
    }catch(e){
        console.error(e);
        interaction.reply("Une erreur s'est produite : " + e);
    }
}