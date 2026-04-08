const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();

// GUARD BOT INTENT'LERİ (Ban/Kick/Mute işlemleri için GuildModeration şart)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsArray = [];

// --- KOMUT YÜKLEYİCİ ---
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath); // Klasör yoksa kendi açar
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
    }
}

// --- EVENT YÜKLEYİCİ ---
const eventsPath = path.join(__dirname, 'events');
if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath); // Klasör yoksa kendi açar
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- SLASH KOMUT TETİKLEYİCİ ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    }
});

// --- RENDER PORT KANDIRMACASI ---
app.get('/', (req, res) => res.send('🛡️ RYPHERA GUARD ONLINE VE NÖBETTE!'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🌐 [WEB] Port ${PORT} üzerinde dinleniyor.`);
});

// BOTA CAN VER
client.once('ready', async () => {
    console.log(`🛡️ [GUARD BOT] Göreve Hazır: ${client.user.tag}`);
    try {
        await client.application.commands.set(commandsArray);
        console.log('✅ Moderasyon Komutları Discord\'a Yüklendi!');
    } catch (error) { 
        console.error('❌ Komut kayıt hatası:', error); 
    }
});

client.login(process.env.TOKEN);