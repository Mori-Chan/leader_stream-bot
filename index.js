require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');

let clients =[];

for (let i=1; i <= 100; i++) {
    if (eval(`process.env.BOT${ i }_TOKEN`)){
        clients[i] = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

        clients[i].once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        clients[i].login(eval(`process.env.BOT${ i }_TOKEN`));
    }
    else {
        return;
    }
}

// const i = 1;

// client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.once(Events.ClientReady, c => {
//     console.log(`Ready! Logged in as ${c.user.tag}`);
// });

// client.login(eval(`process.env.BOT${ i }_TOKEN`));