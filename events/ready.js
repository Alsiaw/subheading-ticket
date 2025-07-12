const { Events, REST, Routes, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        const commands = [];
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '10' }).setToken(client.token);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commands },
                );

                console.log('Successfully reloaded application (/) commands.');

                // Set bot status
                client.user.setPresence({
                    activities: [{ name: '「🟢」User Data ', type: ActivityType.Watching }],
                    status: 'online',
                });
                console.log('✅ Bot status set successfully!');

            } catch (error) {
                console.error(error);
            }
        })();
    }
};
