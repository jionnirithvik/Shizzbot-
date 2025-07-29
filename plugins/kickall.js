export const execute = async (Matrix, mek, { from, isGroup, reply, isOwner }) => {
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
        const botJid = Matrix.user?.id || Matrix.user?.jid;

        // Get all non-admin members except bot
        const membersToRemove = groupMetadata.participants
            .filter(p => p.admin === null && p.id !== botJid)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            return await reply("❌ No members to remove (all are admins or bot).");
        }

        await reply(`⚠️ *WARNING* ⚠️\n\nRemoving *${membersToRemove.length}* members at once...`);

        // **Remove all in one go**
        await Matrix.groupParticipantsUpdate(from, membersToRemove, "remove");

        await reply(`✅ Successfully removed *${membersToRemove.length}* members.\n\n> *Executed by:* @${mek.sender.split('@')[0]}`, {
            mentions: [mek.sender]
        });

    } catch (error) {
        console.error("Kickall error:", error);
        await reply("❌ Failed to remove members. Possibly due to rate limits or permission issues.");
    }
};

export const command = ['kickall', 'removeall', 'cleargroup'];
export const description = 'Instantly remove all non-admin members from the group.';
export const category = 'General';
export const usage = 'kickall';
