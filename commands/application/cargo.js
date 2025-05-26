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
  			.setDescription('The character name (e.g. Terry, B. Jenet).')
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
      const url_cargo = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_COTW%2C&&fields=MoveData_COTW.input%2C+MoveData_COTW.input2%2C+MoveData_COTW.name%2C+MoveData_COTW.version%2C+MoveData_COTW.hitboxes%2C+MoveData_COTW.images%2C+MoveData_COTW.damage%2C+MoveData_COTW.guard%2C+MoveData_COTW.startup%2C+MoveData_COTW.active%2C+MoveData_COTW.recovery%2C+MoveData_COTW.hitadv%2C+MoveData_COTW.blockadv%2C+MoveData_COTW.invul%2C+MoveData_COTW.cancel%2C+MoveData_COTW.idle%2C+MoveData_COTW.rank%2C+MoveData_COTW.revdamage%2C+MoveData_COTW.guardDamage%2C&where=moveId+%3D+%22"+encodeURIComponent(id)+"%22&order+by=&limit=100&format=json";
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
      const revdmg = this.getHyperLink(moveData['revdamage']);
      const gdmg = this.getHyperLink(moveData['guardDamage']);

      // Fetch hitboxes or images if lack of the former.
      let images = (moveData['images'] !== null) ? moveData['images'].toString().trim().split(',') : [];
      let hitboxes = (moveData['hitboxes'] !== null) ? moveData['hitboxes'].toString().trim().split(',') : images;
    
      // Get character link and img for header and thumbnail.
      const link = 'https://dreamcancel.com/wiki/Fatal_Fury:_City_of_the_Wolves' + encodeURIComponent(character);
      const img = this.getCharacterImg(character);
      
      const embeds = [];
      const embed = new MessageEmbed()
        .setColor('#0x1a2c78')
        .setTitle(character)
        .setURL(link)
        .setAuthor({ name: move, iconURL: 'https://pbs.twimg.com/profile_images/1150082025673625600/m1VyNZtc_400x400.png', url: link + '/Data' })
        // .setDescription('Move input')
        .setThumbnail('https://tiermaker.com/images//media/template_images/2024/137019/fatal-fury-city-of-the-wolves-characters-including-dlc-137019/zzzzz-174' + img + '.png')
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
          { name: 'Rev Damage', value: revdmg, inline: true },
          { name: 'Guard Damage', value: gdmg, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Invincibility', value: inv },
          // { name: 'Inline field title', value: 'Some value here', inline: true },
          )
      }
        embed.setFooter({ text: 'Got feedback? Join the COTW server: discord.gg/ChEEUuZwqS', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
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
        await interaction.editReply('There was an error while processing your **cargo** request, reach out to <@259615904772521984>. Refer to the [Google sheet](LINK HERE) to look for the data.');
        return;
      }
  },
  getCharacter: function(character) {
    // Capitilize first letters of each word of the char name.
    let words = character.split(' ')
    for (let i in words) {
	    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
    }
    let char = words.join(' ');
	
    // Validate extra names.
    if (char.includes('Jenet')) return 'B. Jenet';
    const chart = {
      'Billy': 'Billy Kane',
      'Cristiano': 'Cristiano Ronaldo',
      'Ronaldo': 'Cristiano Ronaldo',
      'Hotaru': 'Hotaru Futaba',
      'Kain': 'Kain R. Heinlein',
      'Kevin': 'Kevin Rian',
      'Hwan': 'Kim Dong Hwan',
      'Mai': 'Mai Shiranui',
      'Marco': 'Marco Rodrigues',
      'Rock': 'Rock Howard',
      'Salvatore': 'Salvatore Ganacci',
      'Ganacci': 'Salvatore Ganacci',
      'Terry': 'Terry Bogard',
      'Vox': 'Vox Reaper',
      'Reaper': 'Vox Reaper'
    };
    if (chart[char] === undefined) {
      return char;
    }
    return chart[char];
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
      'Rock Howard': '352409400',
      'Terry Bogard': '352409401',
      'Hotaru Futaba': '352409402',
      'Tizoc': '352409403',
      'Preecha': '352409404',
      'Marco Rodrigues': '352409405',
      'B. Jenet': '352409406',
      'Vox Reaper': '352409407',
      'Kevin Rian': '352409408',
      'Billy Kane': '352409409',
      'Mai Shiranui': '352409510',
      'Kim Dong Hwan': '352409511',
      'Gato': '352409512',
      'Kain R. Heinlein': '352409513',
      'Cristiano Ronaldo': '352409514',
      'Salvatore Ganacci': '370675915',
      'Hokutomaru': '427039516',
    };
    return chartImg[character] + '-' + character.toLowerCase().replace('.','').replace(' ','-').replace('ganacci','gannaci');
  }
};
