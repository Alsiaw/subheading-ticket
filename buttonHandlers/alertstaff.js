const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: 'alertstaff',
    async execute(interaction) {
        try {
            const originalMessage = interaction.message;
            const originalComponents = originalMessage.components;
            
            const updatedComponents = originalComponents.map(row => {
                const newRow = ActionRowBuilder.from(row);
                newRow.components = newRow.components.map(component => {
                    if (component.data.custom_id === 'alertstaff') {
                        return ButtonBuilder.from(component)
                            .setDisabled(true)
                            .setLabel('Staff Alerted ✓')
                            .setStyle(ButtonStyle.Secondary);
                    }
                    return component;
                });
                return newRow;
            });

            await interaction.update({
                components: updatedComponents
            });

            const staffMentions = ayarlar.staffRoles.map(roleId => `<@&${roleId}>`).join(' ');
            const userMentions = ayarlar.threadUsers.map(userId => `<@${userId}>`).join(' ');
            
            await interaction.followUp({
                content: `🚨 **Staff Alert**\n\n${staffMentions} ${userMentions}\n\n**User:** <@${interaction.user.id}>\n**Issue:** Staff attention required\n**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
            });
        } catch (error) {
            console.error('Error alerting staff:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while alerting staff.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'An error occurred while alerting staff.', ephemeral: true });
            }
        }
    }
};
