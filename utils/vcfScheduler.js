import cron from 'node-cron';
import vcfManager from './vcfManager.js';
import storage from './storage.js';

class VCFScheduler {
  constructor() {
    this.isScheduled = false;
    this.cronJob = null;
  }

  // Start the daily VCF distribution scheduler
  start(sock) {
    if (this.isScheduled) {
      console.log('⚠️ VCF scheduler already running');
      return;
    }

    // Schedule for 12:00 PM New York time (Eastern Time)
    // Using 0 17 * * * for UTC (12 PM ET = 5 PM UTC most of the year, 4 PM UTC during DST)
    // We'll use 0 16 * * * to be safe and account for DST
    const cronExpression = '0 16 * * *'; // 4 PM UTC = 12 PM ET during DST, 11 AM ET during standard time
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.distributeVCFToAllUsers(sock);
    }, {
      scheduled: true,
      timezone: "America/New_York" // This handles DST automatically
    });

    this.isScheduled = true;
    console.log('✅ VCF daily distribution scheduled for 12:00 PM New York time');
  }

  // Stop the scheduler
  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
      this.isScheduled = false;
      console.log('⏹️ VCF scheduler stopped');
    }
  }

  // Distribute VCF to all connected users
  async distributeVCFToAllUsers(sock) {
    try {
      console.log('🚀 Starting daily VCF distribution...');
      
      // Get all users from storage
      const allUsers = await storage.findAllUsers();
      if (!allUsers || allUsers.length === 0) {
        console.log('⚠️ No users found for VCF distribution');
        return;
      }

      // Filter users with display names (connected users)
      const connectedUsers = allUsers.filter(user => user.displayName);
      
      if (connectedUsers.length === 0) {
        console.log('⚠️ No connected users with display names found');
        return;
      }

      console.log(`📊 Found ${connectedUsers.length} connected users for VCF distribution`);

      // Compile VCF file
      const compiledResult = await vcfManager.compileAllVCFs(connectedUsers);
      
      if (!compiledResult.success) {
        console.error('❌ Failed to compile VCF file:', compiledResult.error);
        return;
      }

      console.log(`✅ Compiled VCF with ${compiledResult.contactCount} contacts`);

      // Get distribution message
      const distributionMessage = vcfManager.getVCFDistributionMessage(compiledResult.contactCount);

      // Send VCF to all connected users
      let successCount = 0;
      let errorCount = 0;

      for (const user of connectedUsers) {
        try {
          const userSocket = sock[user.phoneNumber];
          if (userSocket && userSocket.user) {
            // Send message with VCF file
            await userSocket.sendMessage(userSocket.user.id, {
              document: { url: compiledResult.filePath },
              fileName: 'ShizzyBot_Contacts.vcf',
              mimetype: 'text/vcard',
              caption: distributionMessage
            });

            successCount++;
            console.log(`✅ VCF sent to ${user.phoneNumber} (${user.displayName})`);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log(`⚠️ User ${user.phoneNumber} not connected or socket not available`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to send VCF to ${user.phoneNumber}:`, error.message);
        }
      }

      console.log(`📈 VCF distribution completed:`);
      console.log(`   ✅ Success: ${successCount} users`);
      console.log(`   ❌ Errors: ${errorCount} users`);
      console.log(`   📁 VCF File: ${compiledResult.filePath}`);
      console.log(`   📊 Total Contacts: ${compiledResult.contactCount}`);

    } catch (error) {
      console.error('❌ Error during VCF distribution:', error.message);
    }
  }

  // Manual trigger for testing
  async triggerManualDistribution(sock) {
    console.log('🔧 Manually triggering VCF distribution...');
    await this.distributeVCFToAllUsers(sock);
  }

  // Get scheduler status
  getStatus() {
    return {
      isScheduled: this.isScheduled,
      nextRun: this.cronJob ? this.cronJob.getStatus() : null,
      cronExpression: this.isScheduled ? '0 12 * * *' : null,
      timezone: 'America/New_York'
    };
  }
}

// Create a singleton instance
const vcfScheduler = new VCFScheduler();

export default vcfScheduler;