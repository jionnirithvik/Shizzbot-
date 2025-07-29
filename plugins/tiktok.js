import axios from 'axios';

const API_ENDPOINT = 'https://api.neoxr.my.id/api';
const API_KEY = 'iamgay';

export const execute = async (Matrix, mek, { args, reply, prefix, command }) => {
    const tiktokUrl = args[0];
    if (!tiktokUrl) {
        await reply(`❌ Please provide a TikTok URL (e.g., ${prefix}${command} https://www.tiktok.com/@user/video/12345)`);
        return;
    }
    if (!tiktokUrl.includes('tiktok.com')) {
        await reply('❌ Invalid TikTok link.');
        return;
    }
    try {
        const res = await axios.get(`${API_ENDPOINT}/tiktok`, {
            params: { url: tiktokUrl, apikey: API_KEY } // <--- apikey here
        });
        const json = res.data;

        if (!json.status) {
            await reply('❌ API returned error:\n' + JSON.stringify(json, null, 2));
            return;
        }

        // Send video (for tiktok/tt/tikwm)
        if ((command === 'tiktok' || command === 'tt' || command === 'tikwm') && json.data.video) {
            await Matrix.sendMessage(mek.key.remoteJid, {
                video: { url: (command === 'tikwm' && json.data.videoWM) ? json.data.videoWM : json.data.video },
                caption: "> © This A New Bot Made By Shixzy Andy",
                mimetype: 'video/mp4'
            }, { quoted: mek });
            return;
        }

        // Send album (photo)
        if (json.data.photo) {
            for (let photo of json.data.photo) {
                await Matrix.sendMessage(mek.key.remoteJid, {
                    image: { url: photo },
                    caption: "> © This A New Bot Made By Shixzy Andy"
                }, { quoted: mek });
                await new Promise(res => setTimeout(res, 1500));
            }
        }

        // Send audio (for tikmp3)
        if (command === 'tikmp3' && json.data.audio) {
            await Matrix.sendMessage(mek.key.remoteJid, {
                audio: { url: json.data.audio },
                mimetype: 'audio/mp3',
                ptt: false
            }, { quoted: mek });
            return;
        }

        // If nothing matched
        if (!json.data.video && !json.data.photo && !(command === 'tikmp3' && json.data.audio)) {
            await reply('❌ No media found or unsupported content.');
        }

    } catch (error) {
        console.error('Error fetching TikTok media:', error);
        await reply('❌ Error occurred while fetching TikTok media.');
    }
};

export const command = ['tiktok', 'tt', 'tikwm', 'tikmp3'];
export const description = 'Download media from TikTok using Neoxr API';
export const category = 'Downloader';
export const usage = `<URL>`;
