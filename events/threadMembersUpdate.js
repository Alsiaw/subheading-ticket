const { Events } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: Events.ThreadMembersUpdate,
    async execute(oldMembers, newMembers, thread) {
        if (!thread || !thread.name) return;
        
        const ticketPrefixes = ['software-', 'support-', 'update-'];
        const isTicketThread = ticketPrefixes.some(prefix => 
            thread.name.startsWith(prefix)
        );
        
        if (!isTicketThread) return;

        const ticketOwnerId = thread.name.split('-')[1];
        const addedMembers = newMembers.filter(member => !oldMembers.has(member.id));
        
        for (const [userId, member] of addedMembers) {
            try {
                if (userId === ticketOwnerId) continue;
                
                const guildMember = await thread.guild.members.fetch(userId).catch(() => null);
                if (!guildMember) continue;
                
                const hasStaffRole = ayarlar.staffRoles.some(roleId => 
                    guildMember.roles.cache.has(roleId)
                );
                const isThreadUser = ayarlar.threadUsers.includes(userId);
                
                if (hasStaffRole || isThreadUser) continue;
                
                await thread.members.remove(userId);
            } catch (error) {
                continue;
            }
        }
    }
};
