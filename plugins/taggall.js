export const execute = async (Matrix, mek, { from, isGroup, reply, isOwner, pushName, args }) => {
    try {
        if (!isGroup) return await reply("❌ This command can only be used in groups!");

        // Check if user is owner/admin
        if (!isOwner) {
            const groupMetadata = await Matrix.groupMetadata(from);
            const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
            if (!groupAdmins.includes(mek.sender)) {
                return await reply("❌ Only group admins can use this command!");
            }
        }

        const groupMetadata = await Matrix.groupMetadata(from);
        const groupMembers = groupMetadata.participants.map(p => p.id);

        if (groupMembers.length === 0) return await reply("❌ No members found in this group!");

        const customMessage = args && args.length > 0 ? args.join(' ') : "Everyone!";

        // Build one clean numbered list
        let mentionText = `╭───「 *TAG ALERT* 」───╮\n\n` +
            `📢 *Message:* ${customMessage}\n` +
            `👤 *By:* @${mek.sender.split('@')[0]}\n` +
            `👥 *Members:* ${groupMembers.length}\n` +
            `🏷️ *Group:* ${groupMetadata.subject}\n` +
            `⏰ *Time:* ${new Date().toLocaleString()}\n\n` +
            `*Tagged Members:* \n`;

        groupMembers.forEach((member, idx) => {
            mentionText += `${idx + 1}. @${member.split('@')[0]}\n`;
        });

        mentionText += `\n> *© Tagged by ${pushName} using SHIZXY BOT MD*`;

        // Send one single big message
        await Matrix.sendMessage(from, {
            text: mentionText,
            contextInfo: { mentionedJid: groupMembers }
        }, { quoted: mek });

        // React success
        await Matrix.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("Error in tagall:", error);
        await reply("❌ An error occurred while tagging members.");
        await Matrix.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
};

export const command = ['tagall', 'everyone', 'all', 'mentionall'];
export const description = 'Tag all members in the group (with optional message)';
export const category = 'Group';
export const usage = 'tagall [message]';
