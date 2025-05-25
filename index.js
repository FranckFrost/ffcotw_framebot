// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const keepAlive = require('./server');
const path = require('path')
const fetch = require('node-fetch'); // to fetch the cargo table (from the module node-fetch@2, not node-fetch)
const he = require('he');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const appCommandFiles = fs.readdirSync('./commands/application').filter(file => file.endsWith('.js'));
const guildCommandFiles = fs.readdirSync('./commands/guild').filter(file => file.endsWith('.js'));

for (const file of appCommandFiles) {
  const command = require(`./commands/application/${file}`);
  client.commands.set(command.data.name, command);
}
for (const file of guildCommandFiles) {
  const command = require(`./commands/guild/${file}`);
  client.commands.set(command.data.name, command);
}

let json = null
let characters = [], json_characters = [];
client.once('ready', () => {
  json = fs.readFileSync("./assets/framedata02um.json", 'utf8');
  json = JSON.parse(json);
  Object.keys(json).forEach(function (key) {
    json_characters.push(key);
  })
  console.log('Ready!');
});
client.on('interactionCreate', async autocomplete => {
	if (!autocomplete.isAutocomplete()) return;
  // console.log(autocomplete.commandName)
	if (autocomplete.commandName === 'embed' || autocomplete.commandName === 'frames' || autocomplete.commandName === 'cargo') {
    let currentOption = autocomplete.options.getFocused(true);
    let currentName = currentOption.name;
    let currentValue = currentOption.value;
    characters = json_characters;

    const options = [];
    if (currentName === "character") {
	    if (autocomplete.commandName === 'cargo') {
		    let cargo_characters = []
		    const url_char = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOF02UM%2C&&fields=MoveData_KOF02UM.chara%2C&&group+by=MoveData_KOF02UM.chara&order+by=&limit=100&format=json"
		    const response_char = await fetch(url_char);
		    const cargo_char = await response_char.json();
		    for (let x in cargo_char) {
			    if (cargo_char[x]["chara"]!==null) cargo_characters.push(cargo_char[x]["chara"])
		    }
		    characters = cargo_characters;
	    }

      characters.forEach((character) => {
        if (character.toLowerCase().includes(currentValue.toLowerCase())) {
          let charObj = {}
          charObj["name"] = character;
          charObj["value"] = character;
          if (options.length < 25) {
            options.push(charObj);
          }
        }
      })
    }
    // If move is focused 
    if (currentName === "move") {
      let character = autocomplete.options.getString('character')
      let moveObj = {}
      if (character === null) {
	    moveObj["name"] = 'You have to enter the character first. Delete and reset the command to try again.';
	    moveObj["value"] = 'You have to enter the character first. Delete and reset the command to try again.';
	    options.push(moveObj);
      } else {
	    // Capitilize first letter(s) of char name.
	    let a = (character.split(' ')[1]!==undefined) ? ' ' + character.split(' ')[1].charAt(0).toUpperCase() + character.split(' ')[1].slice(1) : ""
	    let char = character.split(' ')[0].charAt(0).toUpperCase() + character.split(' ')[0].slice(1) + a;
	    // Validate extra names.
	    character = getCharacter(char)
	    if (autocomplete.commandName === 'cargo') {
		    if (!characters.includes(character)) {
			    moveObj["name"] = 'No cargo data available for ' + character + 'yet. Gather its framedata with /frames instead.';
                            moveObj["value"] = 'No cargo data available for ' + character + 'yet. Gather its framedata with /frames instead.';
                            options.push(moveObj);
		    } else {
			    let move = "";
			    let val = "";
			    const url_moves = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOF02UM%2C&&fields=MoveData_KOF02UM.input%2C+MoveData_KOF02UM.input2%2C+MoveData_KOF02UM.name%2C+MoveData_KOF02UM.version%2C+MoveData_KOF02UM.moveId%2C&where=chara+%3D+%22"+encodeURIComponent(character)+"%22&order+by=MoveData_KOF02UM._ID+ASC&limit=100&format=json"
			    const response_moves = await fetch(url_moves);
			    const cargo_moves = await response_moves.json();
			    for (let x in cargo_moves) {
				    move = cargo_moves[x]["name"]
				    if (cargo_moves[x]["input"] !== null) {
					    move = cargo_moves[x]["name"] + " (" + cargo_moves[x]["input"] + ")"
					    if (cargo_moves[x]["input2"] !== null && cargo_moves[x]["input"] !== cargo_moves[x]["input2"]) {
						    let ver = (cargo_moves[x]["version"] === 'Raw' || cargo_moves[x]["version"] === "Canceled into") ? cargo_moves[x]["version"]+" " : "";
						    move = cargo_moves[x]["name"] + " (" + ver + "[" + cargo_moves[x]["input"] + "] / [" + cargo_moves[x]["input2"] + "])"
						    /*val = he.decode(cargo_moves[x]["moveId"] + "?" + move)
						    if (val.length > 100) {   // choice character limit of 100
							    move = cargo_moves[x]["name"].replaceAll('?','') + " ([" + cargo_moves[x]["input"].replaceAll(' ','') + "] / [" + cargo_moves[x]["input2"].replaceAll(' ','') + "])";
							    val = he.decode(cargo_moves[x]["moveId"] + "?" + move)
							    if (val.length > 100) {   // choice character limit of 100
								    move = move.replaceAll('A/C','P').replaceAll('B/D','K');
							    }
						    }*/
					    }
				    }
				    if (move.toLowerCase().includes(currentValue.toLowerCase())) {
					    moveObj = {}
					    moveObj["name"] = he.decode(move);
					    moveObj["value"] = cargo_moves[x]["moveId"];
					    if (options.length < 25) options.push(moveObj);
				    }
			    }
					  }
	    } else {
		    if (json[character] === undefined) {
			    moveObj["name"] = 'Moves not found for ' + character + ', try another character';
			    moveObj["value"] = 'Moves not found for ' + character + ', try another character';
			    options.push(moveObj);
		    } else {
			    let moves = [];
			    Object.keys(json[character]).forEach(function (key) {
				    moves.push(key);
			    })
			    moves.forEach((move) => {
				    if (move.toLowerCase().includes(currentValue.toLowerCase())) {
					    moveObj = {}
					    moveObj["name"] = move;
					    moveObj["value"] = move;
					    // console.log(move)
					    if (options.length < 25) options.push(moveObj);
				    }
			    })
					  }
	    }
      }
    }
	    await autocomplete.respond(options);
	}
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
	
  if (!command) return;
  await command.execute(interaction);
});
client.on("ready", () => {
  console.log(`Hi, ${client.user.username} is now online and used in ${client.guilds.cache.size} servers.`);
  client.guilds.cache.forEach((guild) => {
    console.log(`${guild.name} with ${guild.memberCount} members.`)
  });

  client.user.setPresence({
    status: "online",
    activities: [{
      name: 'Kyo. Use /frames, /cargo or /help to get started.'
    }],
  }); 
});
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));
client.on('rateLimit', (info) => {
  console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})
// Keep bot alive. (doesn't seem to work on raspberry, port issue to look into later)
// keepAlive();
// Login to Discord with your client's token
const token = process.env['DISCORD_TOKEN']
client.login(token);

function getCharacter(character) {
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
};
