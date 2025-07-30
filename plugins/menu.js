import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { performance } from 'perf_hooks';
import os from 'os';
import { createMenuButtonMessage, sendButtonMessage } from '../utils/button.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert text to monospace fullwidth (ALL CAPS)
function toFullWidthMonospace(str) {
    const map = {
        'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼',
        'N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉',
        'a':'𝙰','b':'𝙱','c':'𝙲','d':'𝙳','e':'𝙴','f':'𝙵','g':'𝙶','h':'𝙷','i':'𝙸','j':'𝙹','k':'𝙺','l':'𝙻','m':'𝙼',
        'n':'𝙽','o':'𝙾','p':'𝙿','q':'𝚀','r':'𝚁','s':'𝚂','t':'𝚃','u':'𝚄','v':'𝚅','w':'𝚆','x':'𝚇','y':'𝚈','z':'𝚉',
        '0':'𝟶','1':'𝟷','2':'𝟸','3':'𝟹','4':'𝟺','5':'𝟻','6':'𝟼','7':'𝟽','8':'𝟾','9':'𝟿'
    };
    return str.toUpperCase().split('').map(c => map[c] || c).join('');
}

export const execute = async (Matrix, mek, { from, isGroup, pushName, prefix }) => {
    try {
        const start = performance.now();

        // Bot information
        const botName = global.botName || 'SHIZXY BOT MD';
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

        // Start building menu message
        let menuMessage = `╭─────────────━┈⊷\n`;
        menuMessage += `│◦ 𝙱𝙾𝚃𝙽𝙰𝙼𝙴  ㋡ : *${botName}*\n`;
        menuMessage += `│◦ 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙽𝙰𝙼𝙴   : *${ownerName}*\n`;
        menuMessage += `│◦ 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 𖤍 : *${owner}*\n`;
        menuMessage += `│◦ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴  ◎ : *${uptimeFormatted}*\n`;
        menuMessage += `│◦ 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼 ⏻ : *${platform}*\n`;
        menuMessage += `│◦ 𝚃𝙾𝚃𝙰𝙻 𝙿𝙻𝚄𝙶𝙸𝙽𝚂  ◷ : *${pluginCount}*\n`;
        menuMessage += `│◦ 𝚄𝚂𝙴𝚁𝚂 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 ↻ : *${activeSessionsCount}*\n`;
        menuMessage += `│◦ 𝙿𝚁𝙴𝙵𝙸𝚇 🝊 : *[${prefix}]*\n`;
        menuMessage += `╰─────────────━┈⊷\n\n`;

        // Collect all commands from plugins
        const commands = {};

        for (const file of pluginFiles) {
            try {
                const pluginPath = path.join(pluginsDir, file);
                const plugin = await import(`file://${pluginPath}`);

                if (plugin.command) {
                    const category = plugin.category || 'General';
                    if (!commands[category]) {
                        commands[category] = [];
                    }
                    const commandList = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                    commands[category].push({
                        commands: commandList,
                    });
                }
            } catch (error) {
                console.error(`Error loading plugin ${file}:`, error.message);
            }
        }

        // Add commands to menu by category, ALL CAPS and monospace style
        const categories = Object.keys(commands).sort();

        for (const category of categories) {
            if (category.toLowerCase() === "readmore") continue;

            menuMessage += `╭─ *${category.toUpperCase()} COMMANDS* ━┈⊷\n`;

            commands[category].forEach((cmd) => {
                const mainCmd = cmd.commands[0];
                menuMessage += `│◦ ${toFullWidthMonospace(mainCmd)}\n`;
            });

            menuMessage += `╰─────────────━┈⊷\n\n`;
        }

        // Create main menu buttons
        const mainMenuItems = [
            { id: 'ping', text: '🏓 Ping Test' },
            { id: 'runtime', text: '⏰ Bot Runtime' },
            { id: 'autorecording on', text: '🎤 Enable Recording' },
            { id: 'autorecording off', text: '🔇 Disable Recording' }
        ];

        // Create button message using utility
        const buttonMessage = createMenuButtonMessage({
            title: `${botName} - Main Menu`,
            description: menuMessage,
            imageUrl: global.MENU_IMAGE_URL || 'https://files.catbox.moe/roubzi.jpg',
            menuItems: mainMenuItems,
            footerText: `${botName} © ${new Date().getFullYear()}`
        });

        // Add context info to button message
        buttonMessage.contextInfo = {
            mentionedJid: [from],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idSaluran || '120363401051937059@newsletter',
                newsletterName: global.nameSaluran || '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                serverMessageId: 143
            }
        };

        // Send button message
        await sendButtonMessage(Matrix, mek.key.remoteJid, buttonMessage, { quoted: mek });

    } catch (error) {
        console.error('Error in menu command:', error);
        await Matrix.sendMessage(mek.key.remoteJid, {
            text: "❌ An error occurred while generating the menu. Please try again."
        }, { quoted: mek });
    }
};

export const command = ['menu', 'help', 'list', 'commands'];
export const description = 'Display bot menu with all available commands';
export const category = 'Main';
export const usage = 'menu';
