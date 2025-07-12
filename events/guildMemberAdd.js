const { EmbedBuilder, Events } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            if (ayarlar.autoRole) {
                const role = member.guild.roles.cache.get(ayarlar.autoRole);
                if (role) {
                    await member.roles.add(role);
                    console.log(`✅ ${member.user.tag} auto role assigned`);
                }
            }

            if (ayarlar.welcomeLogChannel) {
                const logChannel = member.guild.channels.cache.get(ayarlar.welcomeLogChannel);
                if (logChannel) {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✨ New Member Joined ✨')
                        .setDescription(`<@${member.user.id}> welcome to our server! We are now **${member.guild.memberCount}** members.`)
                        .addFields(
                            { name: '👤 User', value: `<@${member.user.id}>`, inline: true },
                            { name: '🆔 ID', value: member.user.id, inline: true },
                            { name: '📅 Join Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() });

                    await logChannel.send({ embeds: [welcomeEmbed] });
                    console.log(`📝 ${member.user.tag} welcome message sent`);
                }
            }
        } catch (error) {
            console.error('❌ New member error:', error);
        }
    },
};
