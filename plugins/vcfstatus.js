import vcfManager from '../utils/vcfManager.js';
import vcfScheduler from '../utils/vcfScheduler.js';
import storage from '../utils/storage.js';

export const command = ['vcfstatus', 'vcfinfo'];

export const execute = async (client, m, { isOwner, reply }) => {
  if (!isOwner) {
    return await reply("❌ This command is only available for bot owners.");
  }

  try {
    // Get all users and VCF info
    const allUsers = await storage.findAllUsers();
    const connectedUsers = allUsers.filter(user => user.displayName);
    const vcfInfo = vcfManager.getCompiledVCFInfo();
    const schedulerStatus = vcfScheduler.getStatus();

    let statusMessage = `*📇 VCF CONTACT MANAGEMENT STATUS*\n\n`;
    statusMessage += `*👥 User Statistics:*\n`;
    statusMessage += `   • Total Users: ${allUsers.length}\n`;
    statusMessage += `   • Connected Users: ${connectedUsers.length}\n\n`;

    statusMessage += `*📋 Compiled VCF File:*\n`;
    if (vcfInfo.exists) {
      statusMessage += `   • Status: ✅ Exists\n`;
      statusMessage += `   • Contact Count: ${vcfInfo.contactCount}\n`;
      statusMessage += `   • File Size: ${(vcfInfo.fileSize / 1024).toFixed(2)} KB\n`;
      statusMessage += `   • Last Modified: ${new Date(vcfInfo.lastModified).toLocaleString()}\n\n`;
    } else {
      statusMessage += `   • Status: ❌ Not Found\n\n`;
    }

    statusMessage += `*⏰ Daily Distribution Scheduler:*\n`;
    statusMessage += `   • Status: ${schedulerStatus.isScheduled ? '✅ Active' : '❌ Inactive'}\n`;
    statusMessage += `   • Time: 12:00 PM New York Time\n`;
    statusMessage += `   • Timezone: ${schedulerStatus.timezone}\n\n`;

    if (connectedUsers.length > 0) {
      statusMessage += `*🔗 Connected Users:*\n`;
      connectedUsers.slice(0, 10).forEach((user, index) => {
        statusMessage += `   ${index + 1}. ${user.displayName} (${user.phoneNumber})\n`;
      });
      
      if (connectedUsers.length > 10) {
        statusMessage += `   ... and ${connectedUsers.length - 10} more\n`;
      }
    }

    statusMessage += `\n*© Shizzy Bot VCF Management System*`;

    await reply(statusMessage);

  } catch (error) {
    console.error('Error in VCF status command:', error);
    await reply(`❌ Error getting VCF status: ${error.message}`);
  }
};