const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const { MessageEmbedVideo } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('frames')
    .setDescription('Pick character name and move, to get a response with all available move data.')
    .addStringOption(character =>
  		character.setName('character')
        .setAutocomplete(true)
  			.setDescription('The character name (e.g. Kyo, Iori).')
  			.setRequired(true))
    .addStringOption(move =>
  		move.setName('move')
        .setAutocomplete(true)
  			.setDescription('The move name or input.')
  			.setRequired(true)),
  async execute(interaction) {
    const character = this.getCharacter(interaction.options.getString('character'));
    const move = interaction.options.getString('move');
    // Load frame data json.
    fs.readFile("./assets/framedata02um.json", "utf8", (err, jsonObject) => {
      if (err) {
        // If unable to read json, exit.
        return interaction.reply('Could not load framedata file. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4) for the data.');
      }
      try {
        console.log(character, move)
        let data = JSON.parse(jsonObject);
        // If character not found, exit.
        if (data.hasOwnProperty(character) === false) {
          return interaction.reply('Could not find character: ' + character + '. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4) for available characters.');
        }
        // If move not found, exit.
        if (data[character].hasOwnProperty(move) === false) {
          return interaction.reply('Could not find specified move: ' + move + ' for ' + character + '. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4) for available moves.');
        }
        
        let moveData = data[character][move];
        const startup = (moveData['Startup (F)'] !== null) ? moveData['Startup (F)'].toString() : '-';
        const active = (moveData['Active (F)'] !== null) ? moveData['Active (F)'].toString() : '-';
        const recovery = (moveData['Recovery (F)'] !== null) ? moveData['Recovery (F)'].toString() : '-';
        const oh = (moveData['On Hit (F)'] !== null) ? moveData['On Hit (F)'].toString() : '-';
        const ob = (moveData['On Guard (F)'] !== null) ? moveData['On Guard (F)'].toString() : '-';
        const notes = (moveData['Notes'] !== null) ? moveData['Notes'].toString() : 'No notes found.';
        const dmg = (moveData['Damage'] !== null) ? moveData['Damage'].toString() : '-';
        // Get character link and img for header and thumbnail
        const link = 'https://dreamcancel.com/wiki/The_King_of_Fighters_2002_UM/' + encodeURIComponent(character);
        const img = this.getCharacterImg(character);
        
        const embeds = [];
        const embed = new MessageEmbed()
          .setColor('#0x1a2c78')
          .setTitle(character)
          .setURL(link)
          .setAuthor({ name: move, iconURL: 'https://pbs.twimg.com/profile_images/1150082025673625600/m1VyNZtc_400x400.png', url: 'https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4' })
          // .setDescription('Move input')
          .setThumbnail('https://tiermaker.com/images/chart/chart/the-king-of-fighters-2002-um-characters-137019/64px-portraitkof2002um' + img + 'png.png')
          .addFields(
            { name: 'Startup', value: startup, inline: true },
            { name: 'Active', value: active, inline: true },
            { name: 'Recovery', value: recovery, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Damage', value: dmg, inline: true },
            { name: 'On hit', value: oh, inline: true },
            { name: 'On block', value: ob, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Notes', value: notes },
            // { name: 'Inline field title', value: 'Some value here', inline: true },
          )
          .setFooter({ text: 'Got feedback? Join the 02UM server: discord.gg/8JNXHxf', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
          (moveData['Image'] != null) ? embed.setImage(moveData['Image']) : embed.addField('No image was found for this move', 'Feel free to share with Franck Frost if you have one.', true);
        embeds.push(embed);
        if (moveData['Image1'] != null) {
          const embed1 = new MessageEmbed().setImage(moveData['Image1']);
          embeds.push(embed1);
        }
        if (moveData['Image2'] != null) {
          const embed2 = new MessageEmbed().setImage(moveData['Image2']);
          embeds.push(embed2);
        }
        if (moveData['Image3'] != null) {
          const embed3 = new MessageEmbed().setImage(moveData['Image3']);
          embeds.push(embed3);
        }
        if (moveData['Image4'] != null) {
          const embed4 = new MessageEmbed().setImage(moveData['Image4']);
          embeds.push(embed4);
        }
        if (moveData['Image5'] != null) {
          const embed5 = new MessageEmbed().setImage(moveData['Image5']);
          embeds.push(embed5);
        }
        if (moveData['Image6'] != null) {
          const embed6 = new MessageEmbed().setImage(moveData['Image6']);
          embeds.push(embed6);
        }
        if (moveData['Image7'] != null) {
          const embed7 = new MessageEmbed().setImage(moveData['Image7']);
          embeds.push(embed7);
        }
        if (moveData['Image8'] != null) {
          const embed8 = new MessageEmbed().setImage(moveData['Image8']);
          embeds.push(embed8);
        }
        if (moveData['Image9'] != null) {
          const embed9 = new MessageEmbed().setImage(moveData['Image9']);
          embeds.push(embed9);
        } //10 embeds max per message
        return interaction.reply({embeds: embeds});
      } catch (error) {
        console.log("Error finishing frames request", error);
        return interaction.reply('There was an error while processing your **frames** request, reach out to <@259615904772521984>. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4) to look for the data.');
      }
    });
  },
  getCharacter: function(character) {
    const chart = {
      'Andy': 'Andy Bogard',
      'Athena': 'Athena Asamiya',
      'Benimaru': 'Benimaru Nikaido',
      'Billy': 'Billy Kane',
      'Mary': 'Blue Mary',
      'Ex Kensou': 'EX Kensou',
      'Ex Robert': 'EX Robert',
      'Ex Takuma': 'EX Takuma',
      'O.Chris': 'Orochi Chris',
      'O.Shermie': 'Orochi Shermie',
      'O.Yashiro': 'Orochi Yashiro',
      'Chang': 'Chang Koehan',
      'Chin': 'Chin Gentsai',
      'Choi': 'Choi Bounge',
      'Clark': 'Clark Still',
      'Foxy': 'Foxy',
      'Daimon': 'Goro Daimon',
      'Hinako': 'Hinako Shijou',
      'Iori': 'Iori Yagami',
      'Jhun': 'Jhun Hoon',
      'Joe': 'Joe Higashi',
      'K`': 'K',
      'K Dash': 'K',
      'Kasumi': 'Kasumi Todoh',
      'Kim': 'Kim Kaphwan',
      'Kula': 'Kula Diamond',
      'Kyo': 'Kyo Kusanagi',
      'Leona': 'Leona Heidern',
      'Xiangfei': 'Li Xiangfei',
      'Mai': 'Mai Shiranui',
      'May Lee': 'May Lee(Normal)',
      'Ralf': 'Ralf Jones',
      'Robert': 'Robert Garcia',
      'Ryo': 'Ryo Sakazaki',
      'Yamazaki': 'Ryuji Yamazaki',
      'Shingo': 'Shingo Yabuki',
      'Kensou': 'Sie Kensou',
      'Takuma': 'Takuma Sakazaki',
      'Terry': 'Terry Bogard',
      'Yashiro': 'Yashiro Nanakase',
      'Yuri': 'Yuri Sakazaki'
    };
    if (chart[character] === undefined) {
      return character;
    }
    return chart[character];
  },
  getCharacterImg: function(character) {
    const chartImg = {
      'EX Kensou': 'kensouex',
      'EX Robert': 'robertex',
      'EX Takuma': 'takumaex',
      'Blue Mary': 'bluemary',
      'Ryuji Yamazaki': 'yamazaki',
      'Goro Daimon': 'daimon',
      'Sie Kensou': 'kensou',
      'May Lee(Normal)': 'maylee',
      'May Lee(Hero)': 'maylee',
      'Li Xiangfei': 'xiangfei',
      'Orochi Chris': 'orochichris',
      'Orochi Shermie': 'orochishermie',
      'Orochi Yashiro': 'orochiyashiro',
    };
    if (chartImg[character] === undefined) {
      return character.toLowerCase().replace('-','').split(' ')[0];
    }
    return chartImg[character];
  }
}
