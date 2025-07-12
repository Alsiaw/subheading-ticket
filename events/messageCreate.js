const { Events } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.channel.isThread()) return;
        
        const ticketPrefixes = ['software-', 'support-', 'update-'];
        const isTicketThread = ticketPrefixes.some(prefix => 
            message.channel.name.startsWith(prefix)
        );
        
        if (!isTicketThread) return;
        if (message.channel.archived) return;

        const mentionPattern = /<@!?(\d+)>/g;
        const mentions = message.content.match(mentionPattern);
        if (!mentions) return;

        const mentionedUserIds = mentions.map(mention => mention.replace(/<@!?(\d+)>/g, '$1'));
        
        for (const userId of mentionedUserIds) {
            try {
                const member = await message.guild.members.fetch(userId);
                if (member && member.roles.cache.has(ayarlar.autoRole)) {
                    await message.channel.members.remove(userId);
                }
            } catch (error) {
                continue;
            }
        }
    }
};
