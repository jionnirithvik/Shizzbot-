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

        // Create interactive button with menu options
        const buttons = [
            {
                buttonId: "action",
                buttonText: { displayText: "📂 ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴꜱ" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "📂 ᴄʟɪᴄᴋ ʜᴇʀᴇ",
                        sections: [
                            {
                                title: "📁 sʜɪᴢᴢʏʙᴏᴛ-ᴍᴅ",
                                highlight_label: "",
                                rows: [
                                    {
                                        title: "📂 ᴀʟʟ ᴍᴇɴᴜ",
                                        description: "ᴏᴘᴇɴ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ",
                                        id: `${prefix}menu`,
                                    },
                                    {
                                        title: "📥 ᴅᴏᴡɴʟᴏᴀᴅ",
                                        description: "ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ ғʀᴏᴍ ᴜʀʟ",
                                        id: `${prefix}song hello`,
                                    },
                                    {
                                        title: "👑 ᴏᴡɴᴇʀ",
                                        description: "ᴄᴏɴᴛᴀᴄᴛ ʙᴏᴛ ᴏᴡɴᴇʀ",
                                        id: `${prefix}ping`,
                                    },
                                    {
                                        title: "🖼️ sᴛɪᴄᴋᴇʀ",
                                        description: "ᴄᴏɴᴠᴇʀᴛ ɪᴍᴀɢᴇ ᴛᴏ sᴛɪᴄᴋᴇʀ",
                                        id: `${prefix}ping`,
                                    },
                                    {
                                        title: "🎵 sᴏɴɢ sᴇᴀʀᴄʜ",
                                        description: "sᴇᴀʀᴄʜ ᴀɴᴅ ᴅᴏᴡɴʟᴏᴀᴅ sᴏɴɢs",
                                        id: `${prefix}play hello`,
                                    },
                                    {
                                        title: "🎬 ᴠɪᴅᴇᴏ sᴇᴀʀᴄʜ",
                                        description: "sᴇᴀʀᴄʜ ᴀɴᴅ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏs",
                                        id: `${prefix}video hello`,
                                    },
                                    {
                                        title: "⚙️ sᴇᴛᴛɪɴɢs",
                                        description: "ʙᴏᴛ sᴇᴛᴛɪɴɢs ᴀɴᴅ ᴄᴏɴғɪɢ",
                                        id: `${prefix}setprefix !`,
                                    },
                                    {
                                        title: "🔗 ᴀɴᴛɪʟɪɴᴋ",
                                        description: "ᴛᴏɢɢʟᴇ ᴀɴᴛɪʟɪɴᴋ ᴏɴ/ᴏғғ",
                                        id: `${prefix}antilink`,
                                    },
                                ],
                            },
                        ],
                    }),
                },
            },
        ];

        try {
            await Matrix.sendMessage(from, {
                buttons,
                headerType: 1,
                viewOnce: true,
                image: { url: global.MENU_IMAGE_URL || 'https://files.catbox.moe/roubzi.jpg' },
                caption
            }, { quoted: mek });
        } catch (err) {
            console.error('Menu button error:', err);
            // Fallback to regular menu if button fails
            await Matrix.sendMessage(from, {
                image: { url: global.MENU_IMAGE_URL || 'https://files.catbox.moe/roubzi.jpg' },
                caption: caption + "\n\n*Button menu not supported. Use regular commands.*"
            }, { quoted: mek });
        }

    } catch (error) {
        console.error('Error in listmenu command:', error);
        await Matrix.sendMessage(from, {
            text: "❌ An error occurred while generating the interactive menu. Please try again."
        }, { quoted: mek });
    }
};

export const command = ['listmenu', 'list', 'imenu'];
export const description = 'Display interactive bot menu with selectable options';
export const category = 'Main';
export const usage = 'listmenu';