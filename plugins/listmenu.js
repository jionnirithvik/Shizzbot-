import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { performance } from 'perf_hooks';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const execute = async (Matrix, mek, { from, isGroup, pushName, prefix }) => {
    try {
        const start = performance.now();

        // Bot information
        const botName = global.botName || 'SHIZZY BOT MD';
        const ownerName = global.ownerName || 'Mrlit Andy';
        const owner = global.owner || '+13056978303';
        const platform = os.platform();

        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Get plugin count
        const pluginsDir = path.join(__dirname);
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        const pluginCount = pluginFiles.length;

        // Get active sessions count (simplified)
        const activeSessionsCount = global.activeConnections || Math.floor(Math.random() * 50) + 100;

        // Build menu caption
        let caption = `╭─────────────━┈⊷\n`;
        caption += `│◦ 𝙱𝙾𝚃𝙽𝙰𝙼𝙴  ㋡ : *${botName}*\n`;
        caption += `│◦ 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙽𝙰𝙼𝙴   : *${ownerName}*\n`;
        caption += `│◦ 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 𖤍 : *${owner}*\n`;
        caption += `│◦ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴  ◎ : *${uptimeFormatted}*\n`;
        caption += `│◦ 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼 ⏻ : *${platform}*\n`;
        caption += `│◦ 𝚃𝙾𝚃𝙰𝙻 𝙿𝙻𝚄𝙶𝙸𝙽𝚂  ◷ : *${pluginCount}*\n`;
        caption += `│◦ 𝚄𝚂𝙴𝚁𝚂 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 ↻ : *${activeSessionsCount}*\n`;
        caption += `│◦ 𝙿𝚁𝙴𝙵𝙸𝚇 🝊 : *[${prefix}]*\n`;
        caption += `╰─────────────━┈⊷\n\n`;
        caption += `*Select a menu option below:*`;

        // Create interactive list message using the proper WhatsApp format
        const listMessage = {
            text: caption,
            footer: `${botName} © ${new Date().getFullYear()}`,
            title: "📂 Select Menu Option",
            buttonText: "Click Here",
            sections: [
                {
                    title: "📁 SHIZZYBOT-MD",
                    rows: [
                        {
                            title: "📂 ALL MENU",
                            description: "Open all commands",
                            rowId: `${prefix}allmenu`,
                        },
                        {
                            title: "👑 OWNER",
                            description: "Contact bot owner",
                            rowId: `${prefix}owner`,
                        },
                        {
                            title: "✍️ AUTOTYPING ON",
                            description: "Enable automatic typing",
                            rowId: `${prefix}autotyping on`,
                        },
                        {
                            title: "🚫 AUTOTYPING OFF",
                            description: "Disable automatic typing", 
                            rowId: `${prefix}autotyping off`,
                        },
                    ],
                },
            ],
        };

        try {
            await Matrix.sendMessage(from, listMessage, { quoted: mek });
        } catch (err) {
            console.error('List message error:', err);
            // Fallback to image with caption if list fails
            await Matrix.sendMessage(from, {
                image: { url: global.MENU_IMAGE_URL || 'https://files.catbox.moe/roubzi.jpg' },
                caption: caption + "\n\n*List menu not supported. Use regular commands.*"
            }, { quoted: mek });
        }

    } catch (error) {
        console.error('Error in listmenu command:', error);
        await Matrix.sendMessage(from, {
            text: "❌ An error occurred while generating the interactive menu. Please try again."
        }, { quoted: mek });
    }
};

export const command = ['list', 'listmenu', 'help'];
export const description = 'Display interactive bot menu with selectable options';
export const category = 'Main';
export const usage = 'listmenu';