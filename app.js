require('dotenv').config();

const { Client, Intents } = require('discord.js');
const discord = require('./assets/js/Discord');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Connect Discord bot
const myIntents = new Intents();

myIntents.add(Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS);

const client = new Client({ intents: myIntents, fetchAllMembers: true });

client.on('ready', function () {
    console.log('ready');
});

client.login(`${process.env.DISCORD_TOKEN}`);

client.on('message', message => {
    discord.onMessage(message);
})

// Register commands

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
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    discord.onInteraction(interaction);
});