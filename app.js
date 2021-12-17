require('dotenv').config();

const { Client, Intents } = require('discord.js');
const discord = require('./assets/js/Discord');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Connect Discord bot
const myIntents = new Intents();

myIntents.add(Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS);

const client = new Client({ intents: myIntents });

client.on('ready', function () {
    console.log('ready');
});

client.login(`${process.env.DISCORD_TOKEN}`);

client.on('message', message => {
    discord.onMessage(message);
})

// Register commands

const rest = new REST({ version: '9' }).setToken(`${process.env.DISCORD_TOKEN}`);

client.once('ready', () => {
    (async () => {
        try {
          console.log('Started refreshing application (/) commands.');
      
          await rest.put(
            Routes.applicationGuildCommands(client.user.id, '703515334832816181'),
            { body: discord.commands },
          );
      
          console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
          console.error(error);
        }
      })();
      discord.setClient(client);

      function checkVips(){
        discord.updateVips();
      }

      checkVips();
      setInterval(checkVips, 3600000); // 1 hour
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    discord.onInteraction(interaction);
});