const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'archive_ticket',
    async execute(interaction) {
        if (!interaction.channel.isThread()) {
            return await interaction.reply({ content: 'Bu komut sadece ticket thread\'lerinde kullanılabilir.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const thread = interaction.channel;
            
            const archiveEmbed = new EmbedBuilder()
                .setTitle('📁 Ticket Arşivlendi')
                .setDescription(`
🎫 ・ **Ticket:** ${thread.name}
👤 ・ **Arşivleyen:** <@${interaction.user.id}>
📅 ・ **Arşivleme Zamanı:** <t:${Math.floor(Date.now() / 1000)}:F>

Bu ticket arşivlendi. Gerekirse yeniden açılabilir.
`)
                .setColor('#000000')
                .setFooter({ text: '© Alsia' })
                .setTimestamp();

            await interaction.editReply({ embeds: [archiveEmbed] });

            setTimeout(async () => {
                await thread.setArchived(true);
            }, 3000);

        } catch (error) {
            console.error('Error archiving ticket:', error);
            await interaction.editReply({ content: 'Ticket arşivlenirken bir hata oluştu.' });
        }
    }
};
