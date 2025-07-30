import vcfScheduler from '../utils/vcfScheduler.js';
import vcfManager from '../utils/vcfManager.js';
import storage from '../utils/storage.js';

export const command = ['distributevcf', 'sendvcf', 'vcf'];

export const execute = async (client, m, { args, isOwner, reply }) => {
  if (!isOwner) {
    return await reply("❌ This command is only available for bot owners.");
  }

  try {
    await reply("🔄 Starting manual VCF distribution...");

    // Get all users
    const allUsers = await storage.findAllUsers();
    const connectedUsers = allUsers.filter(user => user.displayName);

    if (connectedUsers.length === 0) {
      return await reply("⚠️ No connected users found for VCF distribution.");
    }

    // Compile VCF
    const compiledResult = await vcfManager.compileAllVCFs(connectedUsers);
    
    if (!compiledResult.success) {
      return await reply(`❌ Failed to compile VCF: ${compiledResult.error}`);
    }

    // Get distribution message
    const distributionMessage = vcfManager.getVCFDistributionMessage(compiledResult.contactCount);

    // Send VCF to the requesting user as a test
    await client.sendMessage(m.chat, {
      document: { url: compiledResult.filePath },
      fileName: 'ShizzyBot_Contacts.vcf',
      mimetype: 'text/vcard',
      caption: distributionMessage
    }, { quoted: m });

    await reply(`✅ VCF distribution test completed!\n📊 Total contacts: ${compiledResult.contactCount}\n👥 Connected users: ${connectedUsers.length}`);

  } catch (error) {
    console.error('Error in VCF distribution command:', error);
    await reply(`❌ Error distributing VCF: ${error.message}`);
  }
};