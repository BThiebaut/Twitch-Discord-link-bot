require('dotenv').config();

const { Client, Intents, MessageButton } = require('discord.js');
const discord = require('./assets/js/Discord');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Server = require('./assets/js/Server');

const CLIENT_ID = process.env.DISCORD_ID;
const OAUTH_URL = process.env.OAUTH_URL;
const redirect = encodeURIComponent(OAUTH_URL + '/api/discord/callback');

// Connect Discord bot
const myIntents = new Intents();

myIntents.add(Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS);

const client = new Client({ intents: myIntents, fetchAllMembers: true });

client.on('ready', function () {
    console.log('ready');
});

client.login(`${process.env.DISCORD_TOKEN}`);

const rest = new REST({ version: '9' }).setToken(`${process.env.DISCORD_TOKEN}`);


// Connect on every configured guild
client.once('ready', () => {
    const guilds = client.guilds.cache.map(guild => guild.id);

    (async () => {
        try {
          console.log('Started refreshing application (/) commands of every guilds.');
          for(let guild of guilds){
            await rest.put(
              Routes.applicationGuildCommands(client.user.id, guild),
              { body: discord.commands },
            );
          }
      
          console.log('Successfully reloaded application (/) commands of every guilds.');
        } catch (error) {
          console.error(error);
        }
      })();
      discord.setClient(client);

      function checkVips(){
        discord.updateAllVips();
      }

      checkVips();
      setInterval(checkVips, 3600000); // 1 hour
      
      
      // Client presence
      let button = new MessageButton()
      .setCustomId('twitchconnect')
      .setLabel('Connection twitch')
      .setStyle('PRIMARY')
      .setURL(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=connections%20identify%20guilds`)
      ;

      client.user.setPresence({
        status: 'online',
        activities: [{ 
          name   : "/twitchconnect",
          type   : "PLAYING",
          buttons: [{ label: "Lier mon twitch", url : `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=connections%20identify%20guilds` }]
        }],
      });

      Server.run();

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    discord.onInteraction(interaction);
});