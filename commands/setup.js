const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createSetupEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup ticket system in a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to setup ticket system')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        
        if (!channel.isTextBased()) {
            return await interaction.reply({ content: 'Please select a text channel!', ephemeral: true });
        }

        try {
            const setupMessage = createSetupEmbed(interaction.guild);
            await channel.send(setupMessage);
            
            await interaction.reply({ content: `Ticket system successfully set up in ${channel}!`, ephemeral: true });
        } catch (error) {
            console.error('Setup error:', error);
            await interaction.reply({ content: 'An error occurred while setting up the ticket system.', ephemeral: true });
        }
    }
};
