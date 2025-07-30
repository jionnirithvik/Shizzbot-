import fs from 'fs';
import path from 'path';
import { parsePhoneNumber } from 'awesome-phonenumber';

class VCFManager {
  constructor() {
    this.vcfDirectory = './data/vcf';
    this.compiledVCFPath = './data/vcf/shizzybot_contacts.vcf';
    this.ensureVCFDirectory();
  }

  // Ensure VCF directory exists
  ensureVCFDirectory() {
    if (!fs.existsSync(this.vcfDirectory)) {
      fs.mkdirSync(this.vcfDirectory, { recursive: true });
    }
  }

  // Parse phone number and get country info
  parsePhoneNumber(phoneNumber) {
    try {
      // Ensure phone number has + prefix for proper parsing
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = '+' + phoneNumber;
      }
      
      const parsed = parsePhoneNumber(formattedNumber);
      return {
        isValid: parsed.valid,
        international: parsed.number?.international,
        national: parsed.number?.national, 
        countryCode: parsed.countryCode,
        regionCode: parsed.regionCode,
        formatted: parsed.number?.e164 || formattedNumber
      };
    } catch (error) {
      console.log('Error parsing phone number:', error.message);
      // Fallback: ensure we return the phone number in a usable format
      const fallbackNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
      return {
        isValid: false,
        international: fallbackNumber,
        national: phoneNumber,
        countryCode: null,
        regionCode: 'Unknown',
        formatted: fallbackNumber
      };
    }
  }

  // Generate random number for fallback names
  generateRandomNumber() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Create individual VCF for a user
  createUserVCF(phoneNumber, displayName, pushName) {
    const phoneInfo = this.parsePhoneNumber(phoneNumber);
    
    // Determine the display name to use
    let finalName = displayName || pushName;
    if (!finalName || finalName.trim() === '') {
      finalName = `Shizzy Bot ${this.generateRandomNumber()}`;
    }

    // Create VCF content
    const vcfContent = this.generateVCFContent(finalName, phoneInfo);
    
    // Save individual VCF file
    const fileName = `${phoneNumber.replace(/[^0-9]/g, '')}.vcf`;
    const filePath = path.join(this.vcfDirectory, fileName);
    
    try {
      fs.writeFileSync(filePath, vcfContent, 'utf8');
      console.log(`✅ VCF created for ${phoneNumber}: ${fileName}`);
      return {
        success: true,
        fileName,
        filePath,
        vcfContent,
        displayName: finalName,
        phoneInfo
      };
    } catch (error) {
      console.error(`❌ Error creating VCF for ${phoneNumber}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate VCF content for a contact
  generateVCFContent(name, phoneInfo) {
    const vcfVersion = '3.0';
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', 'T').slice(0, 15) + 'Z';
    
    let vcfContent = `BEGIN:VCARD\n`;
    vcfContent += `VERSION:${vcfVersion}\n`;
    vcfContent += `FN:${name}\n`;
    vcfContent += `N:${name};;;;\n`;
    
    // Add phone number (international format preferred)
    if (phoneInfo.isValid && phoneInfo.international) {
      vcfContent += `TEL;TYPE=CELL:${phoneInfo.international}\n`;
    } else {
      vcfContent += `TEL;TYPE=CELL:${phoneInfo.formatted}\n`;
    }
    
    // Add organization
    vcfContent += `ORG:Shizzy Bot Network\n`;
    vcfContent += `NOTE:Connected via Shizzy Bot WhatsApp Bot - Contact shared only for bot users\n`;
    
    // Add timestamp
    vcfContent += `REV:${timestamp}\n`;
    vcfContent += `END:VCARD\n`;
    
    return vcfContent;
  }

  // Compile all user VCFs into one file
  async compileAllVCFs(users) {
    try {
      let compiledContent = '';
      let contactCount = 0;

      for (const user of users) {
        if (user.phoneNumber && user.displayName) {
          const phoneInfo = this.parsePhoneNumber(user.phoneNumber);
          const vcfContent = this.generateVCFContent(user.displayName, phoneInfo);
          compiledContent += vcfContent + '\n';
          contactCount++;
        }
      }

      if (compiledContent) {
        fs.writeFileSync(this.compiledVCFPath, compiledContent, 'utf8');
        console.log(`✅ Compiled VCF created with ${contactCount} contacts`);
        
        return {
          success: true,
          filePath: this.compiledVCFPath,
          contactCount,
          fileSize: fs.statSync(this.compiledVCFPath).size
        };
      } else {
        console.log('⚠️ No contacts to compile');
        return {
          success: false,
          error: 'No contacts to compile'
        };
      }
    } catch (error) {
      console.error('❌ Error compiling VCFs:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete individual user VCF
  deleteUserVCF(phoneNumber) {
    const fileName = `${phoneNumber.replace(/[^0-9]/g, '')}.vcf`;
    const filePath = path.join(this.vcfDirectory, fileName);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ VCF deleted for ${phoneNumber}: ${fileName}`);
        return true;
      } else {
        console.log(`⚠️ VCF file not found for ${phoneNumber}: ${fileName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error deleting VCF for ${phoneNumber}:`, error.message);
      return false;
    }
  }

  // Get VCF distribution message
  getVCFDistributionMessage(contactCount) {
    return `
🎉 *Welcome to Shizzy Bot Contact Network!* 📞

🔥 *Here's your exclusive VCF contact file!* 📋

📊 *Total Contacts:* ${contactCount} users
👥 *Network:* All Shizzy Bot connected users

💡 *How to use this VCF file:*

📱 *For Android:*
   • Download the VCF file
   • Open it with your Contacts app
   • Tap "Import" or "Add to Contacts"

🍎 *For iPhone/iOS:*
   • Download and tap the VCF file
   • Choose "Add All Contacts"
   • Confirm import in Contacts app

📈 *Why use this?* 
✨ More contacts = More WhatsApp Status views!
🚀 Boost your visibility in the Shizzy Bot network
🔐 Exclusive to bot users only

❓ *Need help importing?* 
🎥 Search "how to import VCF contacts" on YouTube for your device

⚠️ *Important:* 
🔒 This file only works for Shizzy Bot users
📝 We use your WhatsApp display name and number
🤝 Share the network, grow together!

*© Shizzy Bot Team - Building connections daily! 🤖*`.trim();
  }

  // Get compiled VCF file info
  getCompiledVCFInfo() {
    try {
      if (fs.existsSync(this.compiledVCFPath)) {
        const stats = fs.statSync(this.compiledVCFPath);
        const content = fs.readFileSync(this.compiledVCFPath, 'utf8');
        const contactCount = (content.match(/BEGIN:VCARD/g) || []).length;
        
        return {
          exists: true,
          filePath: this.compiledVCFPath,
          fileSize: stats.size,
          contactCount,
          lastModified: stats.mtime
        };
      } else {
        return {
          exists: false,
          filePath: this.compiledVCFPath
        };
      }
    } catch (error) {
      console.error('Error getting compiled VCF info:', error.message);
      return {
        exists: false,
        error: error.message
      };
    }
  }
}

// Create a singleton instance
const vcfManager = new VCFManager();

export default vcfManager;