const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { MessageEmbedVideo } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
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
      const url_cargo = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_COTW%2C&&fields=MoveData_COTW.input%2C+MoveData_COTW.input2%2C+MoveData_COTW.name%2C+MoveData_COTW.version%2C+MoveData_COTW.hitboxes%2C+MoveData_COTW.images%2C+MoveData_COTW.damage%2C+MoveData_COTW.guard%2C+MoveData_COTW.startup%2C+MoveData_COTW.active%2C+MoveData_COTW.recovery%2C+MoveData_COTW.hitadv%2C+MoveData_COTW.blockadv%2C+MoveData_COTW.invul%2C+MoveData_COTW.cancel%2C+MoveData_COTW.idle%2C+MoveData_COTW.rank%2C+MoveData_COTW.revdamage%2C+MoveData_COTW.guardDamage%2C&where=chara+%3D+%22"+encodeURIComponent(character)+"%22+AND+moveId+%3D+%22"+encodeURIComponent(id)+"%22&order+by=&limit=100&format=json";
      const response_cargo = await fetch(url_cargo);
      const cargo = await response_cargo.json();
  
      // Preparing the embed data from cargo
      let moveData = cargo[0];
       if (moveData == null) {
	      if (!character.includes(id.split('_')[0])) return interaction.editReply('After validating your **character** you need to delete and reset the command if you wish to change your choice.')
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
      const link = 'https://dreamcancel.com/wiki/Fatal_Fury:_City_of_the_Wolves/' + encodeURIComponent(character);
      const img = this.getCharacterImg(character);
      
      const embeds = [] ; let file
      const embed = new MessageEmbed()
        .setColor('#0x1a2c78')
        .setTitle(character)
        .setURL(link)
        .setAuthor({ name: move, iconURL: 'https://cdn.discordapp.com/icons/95696291010449408/fde1912170361c5ad27c33ef708f1c71.webp?size=100&quality=lossless', url: link + '/Data' })
        // .setDescription('Move input')
        .setThumbnail('https://tiermaker.com/images//media/template_images/2024/137019/fatal-fury-city-of-the-wolves-characters-including-dlc-137019/zzzzz-' + img + '.png')
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
          let ind = "url\":\"", indw = "width\":", indh = "height\":", sw, sh, w, w1, w2, w3, h, h1, h2, h3, canvas, canvas2, canvas3
          
          let url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url|size"
          let response = await fetch(url)
          let car = await response.text()
          let s = car.indexOf(ind) + ind.length
          let image = car.slice(s,car.indexOf("\"",s))
          embed.setImage(image)
          embeds.push(embed)

          if (hitboxes.length > 0) {
			sw = car.indexOf(indw) + indw.length ; sh = car.indexOf(indh) + indh.length
			w =+ car.slice(sw,car.indexOf(",",sw)) ; h =+ car.slice(sh,car.indexOf(",",sh))
			
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url|size"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length ; sw = car.indexOf(indw) + indw.length ; sh = car.indexOf(indh) + indh.length
			w1 =+ car.slice(sw,car.indexOf(",",sw)) ; h1 =+ car.slice(sh,car.indexOf(",",sh))

			canvas = createCanvas(w+w1, Math.max(h,h1)) ; const cs = canvas.getContext('2d')
			image = await loadImage(image) ; const image1 = await loadImage(car.slice(s,car.indexOf("\"",s)))
			cs.drawImage(image, 0, Math.max(h,h1)-h)
			cs.drawImage(image1, w, Math.max(h,h1)-h1)
			
			file = new MessageAttachment(canvas.toBuffer(), 'img.png')
			embed.setImage('attachment://img.png')
            //const embed1 = new MessageEmbed().setImage(image1).setURL(link)
            //embeds.push(embed1)
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url|size"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length ; sw = car.indexOf(indw) + indw.length ; sh = car.indexOf(indh) + indh.length
			w2 =+ car.slice(sw,car.indexOf(",",sw)) ; h2 =+ car.slice(sh,car.indexOf(",",sh))
			const image2 = await loadImage(car.slice(s,car.indexOf("\"",s)))

			canvas2 = createCanvas(w+w1+w2, Math.max(h,h1,h2)) ; const cs2 = canvas2.getContext('2d')
			cs2.drawImage(canvas, 0, Math.max(h,h1,h2)-Math.max(h,h1))
			cs2.drawImage(image2, w+w1, Math.max(h,h1,h2)-h2)
			  
			file = new MessageAttachment(canvas2.toBuffer(), 'img.png')
			embed.setImage('attachment://img.png')
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url|size"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length ; sw = car.indexOf(indw) + indw.length ; sh = car.indexOf(indh) + indh.length
			w3 =+ car.slice(sw,car.indexOf(",",sw)) ; h3 =+ car.slice(sh,car.indexOf(",",sh))
			image3 = await loadImage(car.slice(s,car.indexOf("\"",s)))

			canvas3 = createCanvas(w+w1+w2+w3, Math.max(h,h1,h2,h3)) ; const cs3 = canvas3.getContext('2d')
			cs3.drawImage(canvas2, 0, Math.max(h,h1,h2,h3)-Math.max(h,h1,h2))
			cs3.drawImage(image3, w+w1+w2, Math.max(h,h1,h2,h3)-h3)
			  
			file = new MessageAttachment(canvas3.toBuffer(), 'img.png')
			embed.setImage('attachment://img.png')
          }
        }
      if (file !== undefined) {
		  await interaction.editReply({embeds: embeds, files:[file]});
	  }else{
		  await interaction.editReply({embeds: embeds});
	  }
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
    if (char.includes('Big') || char.includes('big')) return 'Mr. Big';
    if (char.includes('Chun')) return 'Chun-Li';
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
      'Reaper': 'Vox Reaper',
      'Ken': 'Ken Masters',
      'Joe': 'Joe Higashi',
      'Andy': 'Andy Bogard'
    };
    if (chart[char] === undefined) {
      return char;
    }
    return chart[char];
  },
  getHyperLink: function(str,inv) {
    if (inv && (str === null || str === '-')) return 'No recorded invincibility.'; // no invuln found
    if (str === null) return '-'; // no property found
    let s = str.toString().replaceAll('&#039;','');
	let tooltip = '&lt;span class=&quot;tooltip&quot; &gt;'
	if (s.match(tooltip)) return s.replace(tooltip,'').split('&lt;')[0] // remove tooltip
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
      'Rock Howard': '174352409400',
      'Terry Bogard': '174352409401',
      'Hotaru Futaba': '174352409402',
      'Tizoc': '174352409403',
      'Preecha': '174352409404',
      'Marco Rodrigues': '174352409405',
      'B. Jenet': '174352409406',
      'Vox Reaper': '174352409407',
      'Kevin Rian': '174352409408',
      'Billy Kane': '174352409409',
      'Mai Shiranui': '174352409510',
      'Kim Dong Hwan': '174352409511',
      'Gato': '174352409512',
      'Kain R. Heinlein': '174352409513',
      'Cristiano Ronaldo': '174352409514',
      'Salvatore Ganacci': '174370675915',
      'Hokutomaru': '174427039516',
      'Andy Bogard': '175010032817',
      'Chun-Li': '176197878920',
      'Joe Higashi': '175855573519',
      'Ken Masters': '175240207318',
      'Mr. Big': '176415209021',
    };
	let dlc = ["Andy Bogard", "Chun-Li", "Joe Higashi", "Ken Masters", "Mr. Big"], sf = ["Chun-Li", "Ken Masters"], aof = ["Mr. Big"], char = character;
	if (dlc.includes(character)) {
		if (sf.includes(character)) char = char + '-street-fighter'
		if (aof.includes(character)) char = char + '-art-of-fighting'
		char = char + '-dlc'
	}
		
    return chartImg[character] + '-' + char.toLowerCase().replace('.','').replaceAll(' ','-').replace('ganacci','gannaci');
  }
};
