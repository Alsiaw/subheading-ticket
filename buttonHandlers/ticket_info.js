const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'ticket_info',
    async execute(interaction) {
        if (!interaction.channel.isThread()) {
            return await interaction.reply({ content: 'Bu komut sadece ticket thread\'lerinde kullanılabilir.', ephemeral: true });
        }

        const thread = interaction.channel;
        const ticketAcanId = thread.name.split('-').pop() || thread.ownerId;
        const openingTime = thread.createdAt;
        const currentTime = new Date();
        const timeDifference = moment.duration(currentTime - openingTime).humanize();

        const messageCount = await thread.messages.fetch({ limit: 100 });
        const memberCount = thread.members.cache.size;

        const infoEmbed = new EmbedBuilder()
            .setTitle('📋 Ticket Bilgileri')
            .setDescription(`
🎫 ・ **Ticket Adı:** ${thread.name}
👤 ・ **Ticket Açan:** <@${ticketAcanId}>
📅 ・ **Açılma Zamanı:** ${moment(openingTime).format('D MMMM YYYY HH:mm')}
⏰ ・ **Geçen Süre:** ${timeDifference}
💬 ・ **Mesaj Sayısı:** ${messageCount.size}
👥 ・ **Üye Sayısı:** ${memberCount}
📂 ・ **Kategori:** ${thread.name.split('-')[0].toUpperCase()}
🆔 ・ **Thread ID:** ${thread.id}
`)
            .setColor('#000000')
            .setFooter({ text: '© Alsia' })
            .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
    }
};
