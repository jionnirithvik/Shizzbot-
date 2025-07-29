import storage from '../utils/storage.js';

const owner = "13056978303@s.whatsapp.net";

export const execute = async (Matrix, mek, { from, args, isOwner, fromMe, sender, phoneNumber, isGroup }) => {
    // Only allow owner or admin in groups to use this command
    if (!fromMe && sender !== owner && !isOwner) {
        await Matrix.sendMessage(from, { 
            text: '❌ You are not authorized to use this command.'
        }, { quoted: mek });
        return;
    }

    // Only work in groups
    if (!isGroup) {
        await Matrix.sendMessage(from, { 
            text: '❌ This command can only be used in groups.'
        }, { quoted: mek });
        return;
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !["on", "off", "status"].includes(action)) {
        await Matrix.sendMessage(from, { 
            text: `❌ Invalid usage. Please use:\n• ${global.prefix || '.'}antilink on\n• ${global.prefix || '.'}antilink off\n• ${global.prefix || '.'}antilink status`
        }, { quoted: mek });
        return;
    }

    try {
        const currentSettings = await storage.getUserWithDefaults(phoneNumber);
        
        switch (action) {
            case 'on':
                await storage.updateUser(phoneNumber, { antilink: true });
                await Matrix.sendMessage(from, { 
                    text: '✅ Antilink has been *enabled*. Links will be automatically deleted.'
                }, { quoted: mek });
                break;
                
            case 'off':
                await storage.updateUser(phoneNumber, { antilink: false });
                await Matrix.sendMessage(from, { 
                    text: '✅ Antilink has been *disabled*. Links will not be deleted.'
                }, { quoted: mek });
                break;
                
            case 'status':
                const status = currentSettings.antilink ? 'Enabled' : 'Disabled';
                await Matrix.sendMessage(from, { 
                    text: `🔗 *Antilink Status:* ${status}`
                }, { quoted: mek });
                break;
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await Matrix.sendMessage(from, { 
            text: '❌ An error occurred while updating antilink settings. Please try again later.'
        }, { quoted: mek });
    }
};

export const command = ['antilink'];
export const description = 'Toggle antilink on/off - deletes links without banning users';
export const category = 'Admin';
export const usage = '[on/off/status]';