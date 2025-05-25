const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Describes how to use the commands to retrieve frame data'),
  async execute(interaction) {
    const embed = new MessageEmbed()
          .setColor('#0x1a2c78')
          .setTitle('Need Help?')
          .setAuthor({ name: 'FFCOTW FrameBot', iconURL: 'https://cdn.discordapp.com/icons/630700639382405120/2f0abc591122b2bd038650bee6868faa.webp?size=240', url: 'https://discord.gg/ChEEUuZwqS' })
          .addFields(
            { name: 'Getting started', value: 'The bot displays available data of a certain move of a certain character individually per request. It uses autocomplete, so please keep typing to filter the results to your needs.\n Source of the data is the latest [framedata sheet](LINK HERE) for the **/frames** slash command and the [Dream Cancel wiki](https://dreamcancel.com/wiki/Fatal_Fury:_City_of_the_Wolves) for **/cargo**.\n Their common arguments are as follows:', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Character', value: 'The **character** which is a case insensitive string (e.g. rock, Terry)', inline: false },
            { name: 'Move', value: 'The **move** name or input which is a case insensitive string (e.g. crouch A, power wave)', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Demo', value: 'The following is a visual representation of how the bot works:', inline: false },
          )
          .setImage('https://media.giphy.com/media/LrqUuAZB2E3hGvHtOH/giphy.gif')
          .setFooter({ text: 'Got feedback? Join the COTW server: https://discord.gg/ChEEUuZwqS', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
        return interaction.reply({embeds: [embed]});
  },
};
