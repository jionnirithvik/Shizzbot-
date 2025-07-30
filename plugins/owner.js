export const execute = async (Matrix, mek, { from, pushName, prefix }) => {
    try {
        const ownerName = "Mrlit Andy";
        const ownerNumber = "+13056978303";
        const botName = "SHIZZY BOT MD";
        
        const ownerMessage = `
╭─────────────━┈⊷
│◦ 👑 *BOT OWNER INFO* 
│◦ 🏷️ *Name:* ${ownerName}
│◦ 📱 *Number:* ${ownerNumber}
│◦ 🤖 *Bot:* ${botName}
│◦ 👤 *Your Name:* ${pushName}
╰─────────────━┈⊷

*Contact the owner for support, suggestions, or issues!*`;

        await Matrix.sendMessage(from, {
            text: ownerMessage
        }, { quoted: mek });

    } catch (error) {
        console.error('Error in owner command:', error);
        await Matrix.sendMessage(from, {
            text: "❌ An error occurred while fetching owner information."
        }, { quoted: mek });
    }
};

export const command = ['owner'];
export const description = 'Display bot owner contact information';
export const category = 'Info';
export const usage = 'owner';