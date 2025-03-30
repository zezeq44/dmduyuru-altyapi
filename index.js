const { Client, GatewayIntentBits, Collection, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});
const config = require('./config.json');

client.commands = new Collection();
client.aliases = new Collection();

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!dmduyuru')) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Bu komutu kullanmak için yönetici olmanız gerekiyor.');
        }

        const args = message.content.slice('!dmduyuru'.length).trim();
        if (!args) {
            return message.reply('Lütfen bir duyuru mesajı girin.');
        }

        const members = await message.guild.members.fetch();

        members.forEach(async (member) => {
            if (!member.user.bot) {
                try {
                    await member.user.send(args);
                } catch (error) {
                    console.error(`DM gönderilemedi: ${member.user.tag}`);
                }
            }
        });

        message.reply('Duyuru mesajı tüm üyelere DM olarak gönderildi.');
    }
});

fs.readdir('./events/', (err, files) => {
    if (err) console.error(err);
    files.forEach(file => {
        let eventHandler = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, (...args) => eventHandler(client, ...args));
    });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
    }
});

client.login(config.token);
