require('dotenv').config();
const twitch = require('./Twitch');
const db = require('./Db');
const { Permissions } = require('discord.js');

let client;

let onVipsResponse = vipList => {
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
    }
];

exports.setClient = (bot) => {
    client = bot;
}

exports.onMessage = message => {
    
};

exports.updateVips = () => {
    twitch.getVips().then(onVipsResponse, console.error);
}

exports.onInteraction = interaction => {
    if (interaction.commandName === 'vipsync' && interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
        twitch.getVips().then(onVipsResponse, console.error);
        interaction.reply('La synchronisation des VIPs a bien été initialisée');
    }else if (interaction.commandName === 'twitchname'){
        setTwitchName(interaction);
    }
}