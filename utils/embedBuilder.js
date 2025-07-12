const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ayarlar = require('../ayarlar.json');

function createSetupEmbed(guild) {
    const embed = new EmbedBuilder()
        .setTitle(ayarlar.embedConfig.title)
        .setDescription(ayarlar.embedConfig.description)
        .setColor(ayarlar.embedConfig.color)
        .setThumbnail(guild ? guild.iconURL() : ayarlar.embedConfig.thumbnail)
        .setFooter({ text: ayarlar.embedConfig.footer })
        .addFields(
            {
                name: ayarlar.embedConfig.beforeOpeningTitle,
                value: ayarlar.embedConfig.beforeOpeningDesc,
                inline: false
            }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('software')
                .setLabel('Software')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(ayarlar.emojis.software),
            new ButtonBuilder()
                .setCustomId('support')
                .setLabel('Support')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(ayarlar.emojis.support),
            new ButtonBuilder()
                .setCustomId('update')
                .setLabel('Update')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(ayarlar.emojis.update)
        );

    return { embeds: [embed], components: [row] };
}

function createTicketEmbed(ticketType, user, guild) {
    const config = ayarlar.ticketMessages[ticketType];
    
    const embed = new EmbedBuilder()
        .setTitle(config.title)
        .setDescription(config.description.replace('{user}', user))
        .setColor(config.color)
        .setThumbnail(guild ? guild.iconURL() : ayarlar.embedConfig.thumbnail)
        .setFooter({ text: ayarlar.embedConfig.footer })
        .addFields(
            {
                name: config.requestInfo.split('\n')[0],
                value: config.requestInfo.split('\n').slice(1).join('\n'),
                inline: false
            },
            {
                name: config.category.split('\n')[0],
                value: config.category.split('\n').slice(1).join('\n'),
                inline: false
            },
            {
                name: config.consent.split('\n')[0],
                value: config.consent.split('\n').slice(1).join('\n'),
                inline: false
            }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('alertstaff')
                .setLabel('Alert Staff')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(ayarlar.emojis.alertstaff),
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(ayarlar.emojis.closeticket)
        );

    return { embeds: [embed], components: [row] };
}

module.exports = { createSetupEmbed, createTicketEmbed };
