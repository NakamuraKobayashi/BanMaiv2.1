const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */

module.exports = async (client, message) => {
    if (message.partial) return;
    if (message.author.bot || !message.guild) return;
    const settings = await getSettings(message.guild);
    if (!settings.modlog_channel) return;
    const logChannel = message.guild.channels.cache.get(settings.modlog_channel);
    if (!logChannel) return;

    client.on("MessageDelete", message => {
        const image = message.attachments.first()
        ? message.attachments.first().proxyURL
        : null
        if(message.channel.type !== "text" || message.author.bot) return;
        const DelMsg = EmbedBuilder()
            .setTitle("Tin nhắn bị xóa")
            .setColor("Yellow")
            .setDescription(`${message.content}` || `${image}`)
            .setFooter({ text: `Xóa lúc: ${message.createdAt}` });
        logChannel.send({ embeds: [DelMsg] });
    })
}