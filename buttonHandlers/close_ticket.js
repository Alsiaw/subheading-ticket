const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: 'close_ticket',
    async execute(interaction) {
        if (!interaction.channel.isThread()) {
            return await interaction.reply({ content: 'This command can only be used in ticket threads.', ephemeral: true });
        }

        const hasStaffRole = ayarlar.staffRoles.some(roleId => 
            interaction.member.roles.cache.has(roleId)
        );

        if (!hasStaffRole) {
            return await interaction.reply({ 
                content: 'You do not have the required permissions to close tickets.', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const thread = interaction.channel;
            const ticketOwnerId = thread.name.split('-')[1];
            const closingTime = new Date();
            const openingTime = thread.createdAt;
            const timeDifference = moment.duration(closingTime - openingTime).humanize();

            const messages = await thread.messages.fetch({ limit: 100 });
            const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            const validMessages = sortedMessages.filter(msg => 
                msg.content || msg.embeds.length > 0 || msg.attachments.size > 0
            );

            const profiles = {};
            const uniqueUsers = new Set();
            
            validMessages.forEach(msg => {
                uniqueUsers.add(msg.author.id);
            });

            for (const userId of uniqueUsers) {
                const user = validMessages.find(msg => msg.author.id === userId)?.author;
                if (user) {
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    const roleColor = member?.roles?.highest?.color ? '#' + member.roles.highest.color.toString(16).padStart(6, '0') : '#ffffff';
                    const roleName = member?.roles?.highest?.name || 'Member';
                    
                    profiles[userId] = {
                        author: user.displayName || user.username,
                        avatar: user.displayAvatarURL({ size: 64 }),
                        roleColor: roleColor,
                        roleName: roleName,
                        bot: user.bot,
                        verified: false
                    };
                }
            }

            const profilesScript = 'window.$discordMessage={profiles:' + JSON.stringify(profiles) + '};';
            const guildIcon = interaction.guild.iconURL({ size: 16 }) || '';
            const guildIconLarge = interaction.guild.iconURL({ size: 128 }) || '';
            
            let htmlContent = '<!DOCTYPE html><html><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="icon" type="image/png" href="' + guildIcon + '"/><title>' + thread.name + '</title><script>document.addEventListener("click",t=>{let e=t.target;if(!e)return;let o=e?.getAttribute("data-goto");if(o){let r=document.getElementById("m-"+o);r?(r.scrollIntoView({behavior:"smooth",block:"center"}),r.style.backgroundColor="rgba(148, 156, 247, 0.1)",r.style.transition="background-color 0.5s ease",setTimeout(()=>{r.style.backgroundColor="transparent"},1e3)):console.warn("Message "+o+" not found.")}});</script><script>' + profilesScript + '</script><script type="module" src="https://cdn.jsdelivr.net/npm/@derockdev/discord-components-core@^3.6.1/dist/derockdev-discord-components-core/derockdev-discord-components-core.esm.js"></script></head><body style="margin:0;min-height:100vh"><discord-messages style="min-height:100vh"><discord-header guild="' + interaction.guild.name + '" channel="' + thread.name + '" icon="' + guildIconLarge + '">' + ticketOwnerId + ' | ' + thread.name.split('-')[0].toUpperCase() + ' SUPPORT</discord-header>';

            validMessages.forEach(msg => {
                let content = msg.content || '';
                let embedsContent = '';
                let attachmentsContent = '';

                content = content.replace(/<@!?(\d+)>/g, (match, userId) => {
                    const user = profiles[userId];
                    return '<discord-mention type="user">' + (user ? user.author : 'User') + '</discord-mention>';
                });
                content = content.replace(/<#(\d+)>/g, '<discord-mention type="channel">#channel</discord-mention>');
                content = content.replace(/<@&(\d+)>/g, '<discord-mention type="role" color="#ff9d00">Role</discord-mention>');

                if (msg.embeds.length > 0) {
                    msg.embeds.forEach(embed => {
                        let embedFields = '';
                        if (embed.fields && embed.fields.length > 0) {
                            embed.fields.forEach(field => {
                                embedFields += '<discord-embed-field field-title="' + field.name + '" inline="' + (field.inline || false) + '">' + field.value + '</discord-embed-field>';
                            });
                        }

                        let embedDescription = embed.description || '';
                        embedDescription = embedDescription.replace(/<@!?(\d+)>/g, (match, userId) => {
                            const user = profiles[userId];
                            return '<discord-mention type="user">' + (user ? user.author : 'User') + '</discord-mention>';
                        });

                        embedsContent += '<discord-embed slot="embeds"';
                        if (embed.author && embed.author.name) embedsContent += ' author-name="' + embed.author.name + '"';
                        if (embed.author && embed.author.iconURL) embedsContent += ' author-image="' + embed.author.iconURL + '"';
                        if (embed.color) embedsContent += ' color="#' + embed.color.toString(16).padStart(6, '0') + '"';
                        if (embed.thumbnail && embed.thumbnail.url) embedsContent += ' thumbnail="' + embed.thumbnail.url + '"';
                        if (embed.image && embed.image.url) embedsContent += ' image="' + embed.image.url + '"';
                        embedsContent += '>';
                        if (embed.title) embedsContent += '<discord-embed-title slot="title">' + embed.title + '</discord-embed-title>';
                        if (embedDescription) embedsContent += '<discord-embed-description slot="description">' + embedDescription + '</discord-embed-description>';
                        embedsContent += embedFields + '</discord-embed>';
                    });
                }

                if (msg.attachments.size > 0) {
                    msg.attachments.forEach(attachment => {
                        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                            attachmentsContent += '<discord-attachment slot="attachments" url="' + attachment.url + '" name="' + attachment.name + '" alt="Image attachment"></discord-attachment>';
                        }
                    });
                }

                htmlContent += '<discord-message id="m-' + msg.id + '" timestamp="' + msg.createdAt.toISOString() + '" edited="false" highlight="false" profile="' + msg.author.id + '">' + content + embedsContent + attachmentsContent + '</discord-message>';
            });

            htmlContent += '<div style="text-align:center;width:100%">' + interaction.guild.name + '</div></discord-messages></body></html>';

            const logDir = path.join(__dirname, '..', 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logFileName = 'ticket-' + thread.name + '-' + Date.now() + '.html';
            const logFilePath = path.join(logDir, logFileName);
            fs.writeFileSync(logFilePath, htmlContent);

            const logChannel = interaction.guild.channels.cache.get(ayarlar.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setDescription('**Ticket Owner:** <@' + ticketOwnerId + '>\n**Closed By:** <@' + interaction.user.id + '>\n\n**» SUPPORT CHANNEL**\n```\n- ' + thread.name + '\n```\n**» SUPPORT CATEGORY**\n```\n- ' + thread.name.split('-')[0].toUpperCase() + '\n```\n**» OPENING - CLOSING TIME**\n```\n- ' + moment(openingTime).format('D MMMM YYYY HH:mm') + ' - ' + moment(closingTime).format('D MMMM YYYY HH:mm') + '\n- DURATION: ' + timeDifference + '\n```')
                    .setColor('#000000')
                    .setFooter({ text: '© Alsia' })
                    .setTimestamp();

                await logChannel.send({ 
                    embeds: [logEmbed], 
                    files: [{ 
                        attachment: logFilePath, 
                        name: logFileName 
                    }] 
                });
            }

            await interaction.editReply({ content: 'Ticket Closed' });
            await thread.delete();

        } catch (error) {
            await interaction.editReply({ content: 'An error occurred while closing the ticket.' });
        }
    }
};
