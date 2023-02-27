require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

let clients = [];

for (let i = 0; i < 100; i++) {
    if (eval(`process.env.BOT${ i }_TOKEN`)){
        clients[i] = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

        clients[i].once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        clients[i].login(eval(`process.env.BOT${ i }_TOKEN`));
    }
    else {
        break;
    }
}

clients[0].commands = new Collection();

// commandsフォルダから、.jsで終わるファイルのみを取得
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
	if ('data' in command && 'execute' in command) {
		clients[0].commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING]  ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`);
	}
}

clients[0].on(Events.InteractionCreate, async interaction => {
    // コマンドでなかった場合は処理せずさよなら。
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.clients[0].commands.get(interaction.commandName);

    // 一致するコマンドがなかった場合
	if (!command) {
		console.error(` ${interaction.commandName} というコマンドは存在しません。`);
		return;
	}

	try {
        // コマンドを実行
		await command.execute(interaction, clients);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'コマンドを実行中にエラーが発生しました。', ephemeral: true });
	}
});



// for (client of clients) {
//     client.commands = new Collection();
// }

// const i = 1;

// client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.once(Events.ClientReady, c => {
//     console.log(`Ready! Logged in as ${c.user.tag}`);
// });

// client.login(eval(`process.env.BOT${ i }_TOKEN`));