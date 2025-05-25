const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageEmbedVideo } = require('discord.js');
const fetch = require('node-fetch');
const he = require('he');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cargo')
    .setDescription('Pick character name and move, to get a response with all available cargo data.')
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
    await interaction.deferReply();
    try {
      const character = this.getCharacter(interaction.options.getString('character'));
      const id = interaction.options.getString('move');
      
      // Fetch the cargo data with the appropriate moveId
      const url_cargo = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOF02UM%2C&&fields=MoveData_KOF02UM.input%2C+MoveData_KOF02UM.input2%2C+MoveData_KOF02UM.name%2C+MoveData_KOF02UM.version%2C+MoveData_KOF02UM.hitboxes%2C+MoveData_KOF02UM.images%2C+MoveData_KOF02UM.damage%2C+MoveData_KOF02UM.guard%2C+MoveData_KOF02UM.startup%2C+MoveData_KOF02UM.active%2C+MoveData_KOF02UM.recovery%2C+MoveData_KOF02UM.hitadv%2C+MoveData_KOF02UM.blockadv%2C+MoveData_KOF02UM.invul%2C+MoveData_KOF02UM.cancel%2C+MoveData_KOF02UM.idle%2C+MoveData_KOF02UM.rank%2C+MoveData_KOF02UM.idle%2C&where=moveId+%3D+%22"+encodeURIComponent(id)+"%22&order+by=&limit=100&format=json";
      const response_cargo = await fetch(url_cargo);
      const cargo = await response_cargo.json();
  
      // Preparing the embed data from cargo
      let moveData = cargo[0];
      if (moveData == null) {
        return interaction.editReply('You are free to manually enter the **character** but you have to select the **move** from the scroll list. You can type to refine the search.')
      }
      let move = moveData["name"]
      if (moveData["input"] !== null) {
	      move = moveData["name"] + " (" + moveData["input"] + ")"
	      if (moveData["input2"] !== null && moveData["input"] !== moveData["input2"]) {
		      let ver = (moveData["version"] === 'Raw' || moveData["version"] === "Canceled into") ? moveData["version"]+" " : "";
		      move = moveData["name"] + " (" + ver + "[" + moveData["input"] + "] / [" + moveData["input2"] + "])"
	      }
      }
      move = he.decode(move)
      console.log("cargo", character, move)
      const startup = this.getHyperLink(moveData['startup']);
      const active = this.getHyperLink(moveData['active']);
      const recovery = this.getHyperLink(moveData['recovery']);
      const rank = this.getHyperLink(moveData['rank']);
      const idle = this.getHyperLink(moveData['idle']);
      const oh = this.getHyperLink(moveData['hitadv']);
      const ob = this.getHyperLink(moveData['blockadv']);
      const inv = this.getHyperLink(moveData['invul'],1);
      const dmg = this.getHyperLink(moveData['damage']);
      const guard = this.getHyperLink(moveData['guard']);
      const cancel = this.getHyperLink(moveData['cancel']);

      // Fetch hitboxes or images if lack of the former.
      let images = (moveData['images'] !== null) ? moveData['images'].toString().trim().split(',') : [];
      let hitboxes = (moveData['hitboxes'] !== null) ? moveData['hitboxes'].toString().trim().split(',') : images;
    
      // Get character link and img for header and thumbnail.
      const link = 'https://dreamcancel.com/wiki/The_King_of_Fighters_2002_UM/' + encodeURIComponent(character);
      const img = this.getCharacterImg(character);
      
      const embeds = [];
      const embed = new MessageEmbed()
        .setColor('#0x1a2c78')
        .setTitle(character)
        .setURL(link)
        .setAuthor({ name: move, iconURL: 'https://pbs.twimg.com/profile_images/1150082025673625600/m1VyNZtc_400x400.png', url: link + '/Data' })
        // .setDescription('Move input')
        .setThumbnail('https://tiermaker.com/images/chart/chart/the-king-of-fighters-2002-um-characters-137019/64px-portraitkof2002um' + img + 'png.png')
        .addFields(
          { name: 'Startup', value: startup, inline: true },
          { name: 'Active', value: active, inline: true },
          { name: 'Recovery', value: recovery, inline: true },
          { name: '\u200B', value: '\u200B' },
          )
      if (idle === "yes") {
        embed.addFields({ name: 'Rank', value: rank})
      }else{
        embed.addFields(
          { name: 'Damage', value: dmg, inline: true },
          { name: 'Cancel', value: cancel, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Guard', value: guard, inline: true },
          { name: 'On hit', value: oh, inline: true },
          { name: 'On block', value: ob, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Invincibility', value: inv },
          // { name: 'Inline field title', value: 'Some value here', inline: true },
          )
      }
        embed.setFooter({ text: 'Got feedback? Join the 02UM server: discord.gg/8JNXHxf', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
        if (hitboxes.length === 0) {
          embed.addField('No image was found for this move', 'Feel free to share with Franck Frost if you have one.', true);
          embeds.push(embed)
        } else {
          let ind = "url\":\""
          
          let url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
          let response = await fetch(url)
          let car = await response.text()
          let s = car.indexOf(ind) + ind.length
          let image = car.slice(s,car.indexOf("\"",s))
          embed.setImage(image)
          embeds.push(embed)

          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image1 = car.slice(s,car.indexOf("\"",s))
            const embed1 = new MessageEmbed().setImage(image1)
            embeds.push(embed1)
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image2 = car.slice(s,car.indexOf("\"",s))
            const embed2 = new MessageEmbed().setImage(image2)
            embeds.push(embed2)
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image3 = car.slice(s,car.indexOf("\"",s))
            const embed3 = new MessageEmbed().setImage(image3)
            embeds.push(embed3)
          }
        }
      await interaction.editReply({embeds: embeds});
      return;
      } catch (error) {
        console.log("Error finishing cargo request", error);
        await interaction.editReply('There was an error while processing your **cargo** request, reach out to <@259615904772521984>. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1lzpQMoGAboJezLT9WRd3O-vlNDNRlgF_47ShtBGZ3G4) to look for the data.');
        return;
      }
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
  getHyperLink: function(str,inv) {
    if (inv && str === null) return 'No recorded invincibility.'; // no invuln found
    if (str === null) return '-'; // no property found
    let s = str.toString().replaceAll('&#039;','');
    if (s.match(/.*?\[\[.*?\]\].*/) === null) return s.replaceAll('_',' '); // no hyperlink found
    
    let t="", u="", v=[], w=[], x=[], y=[], z=(s.split(',')[1]!==undefined) ? s.split(',') : s.split(';')
    for (let i in z) {
        y[i] = z[i].match(/.*?\[\[.*?\]\].*/g)
    }
    for (let i in y) {
      if (y[i] === null) {
          x.push(z[i])
      }else{
          let wiki = "https://dreamcancel.com/wiki/"
          for (let j in y[i]) {
              w = y[i][j].replace(']]','').split('[[')
              v = w[1].split('|')
              if (v[1].includes("HKD")) u = " \'Hard Knockdown\'"
              if (v[1].includes("SKD")) u = " \'Soft Knockdown\'"
              x.push(w[0] + '[' + v[1] + '](' + wiki + v[0] + u + ')')
          }
      }
    }
    for (let i in x) {
        t = t + x[i] + ','
    }
    return t.slice(0, -1);
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
};
