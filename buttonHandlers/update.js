const { ChannelType } = require('discord.js');
const { createTicketEmbed } = require('../utils/embedBuilder');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: 'update',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.user.id;
            const activeTickets = interaction.guild.channels.cache.filter(channel => 
                channel.isThread() && 
                channel.name.includes(`-${userId}-`) && 
                !channel.archived
            );

            if (activeTickets.size >= ayarlar.maxTicketsPerUser) {
                await interaction.editReply({ content: ayarlar.errorMessages.tooManyTickets });
                return;
            }

            const ticketName = `update-${userId}-${Date.now()}`;
            
            const thread = await interaction.channel.threads.create({
                name: ticketName,
                type: ChannelType.PrivateThread,
                reason: `Update ticket created by ${interaction.user.tag}`
            });

            await thread.members.add(userId);
            
            for (const threadUserId of ayarlar.threadUsers) {
                try {
                    await thread.members.add(threadUserId);
                } catch (error) {
                    continue;
                }
            }

            const ticketMessage = createTicketEmbed('update', `<@${userId}>`, interaction.guild);
            await thread.send(ticketMessage);

            const threadLink = `https://discord.com/channels/${interaction.guild.id}/${thread.id}`;
            const message = ayarlar.messages.ticketCreated.replace('{threadLink}', threadLink);
            await interaction.editReply({ content: message });

        } catch (error) {
            await interaction.editReply({ content: 'An error occurred while creating the ticket.' });
        }
    }
};
