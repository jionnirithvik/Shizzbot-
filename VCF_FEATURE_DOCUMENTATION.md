# VCF Contact Management Feature

This document describes the new VCF (vCard) contact management feature implemented for the Shizzy Bot WhatsApp multi-user system.

## Overview

The VCF feature automatically captures and manages contact information from connected WhatsApp users, creating a shared contact network that is distributed daily to all bot users.

## Key Features

### 1. Automatic Contact Detection
- **User Connection**: When a new user connects to the bot, their WhatsApp display name and phone number are automatically captured
- **Country Code Parsing**: Phone numbers are parsed to extract country codes and formatting using the `awesome-phonenumber` library
- **Fallback Names**: If no display name is available, the system generates a fallback name in the format "Shizzy Bot XXXX" (with random numbers)

### 2. VCF File Management
- **Individual VCF Files**: Each connected user gets their own VCF file stored in `./data/vcf/`
- **Compiled VCF**: All individual contacts are compiled into a single VCF file: `./data/vcf/shizzybot_contacts.vcf`
- **Standard vCard Format**: Files use vCard 3.0 format compatible with Android and iOS devices

### 3. Daily Distribution
- **Scheduled Delivery**: Every day at 12:00 PM New York time, the compiled VCF is sent to all connected users
- **Professional Message**: Includes friendly instructions for importing VCF files on Android and iOS
- **Contact Count**: Shows total number of contacts in the shared file
- **Usage Benefits**: Explains how importing contacts can increase WhatsApp Status views

### 4. Session Management
- **Connection Handler**: VCF creation is integrated into the user connection process
- **Disconnection Cleanup**: When users disconnect, their VCF files are immediately deleted and the compiled VCF is updated
- **Database Integration**: User display names and VCF metadata are stored in the database

## Technical Implementation

### New Files Added
- `utils/vcfManager.js` - Core VCF creation and management functionality
- `utils/vcfScheduler.js` - Daily distribution scheduling using node-cron
- `plugins/vcfdistribute.js` - Manual VCF distribution command for testing
- `plugins/vcfstatus.js` - VCF status monitoring command

### Database Schema Updates
Added new columns to the users table:
- `display_name` - User's WhatsApp display name
- `vcf_file_name` - Name of user's individual VCF file
- `last_vcf_update` - Timestamp of last VCF update

### Modified Files
- `src/index.js` - Integrated VCF functionality into connection handlers
- `utils/storage.js` - Added VCF fields to default user settings
- `models/user.js` - Updated database model to include VCF fields
- `utils/connectDB.js` - Added database migration for new VCF columns

## Usage Instructions

### For Bot Owners
1. **View VCF Status**: Use `.vcfstatus` command to see current statistics
2. **Manual Distribution**: Use `.distributevcf` command to test VCF distribution
3. **Health Monitoring**: Check `/health` endpoint for VCF system status

### For Users
1. **Automatic Process**: No action needed - contacts are captured automatically upon connection
2. **Daily Delivery**: Receive VCF file daily at 12 PM NY time with instructions
3. **Import Process**: Follow provided instructions to import contacts on your device

## Distribution Message Template

The bot sends a professional message with each VCF distribution including:
- 🎉 Welcome message with emojis
- 📊 Total contact count
- 💡 Step-by-step import instructions for Android and iOS
- 📈 Benefits explanation (more contacts = more Status views)
- ❓ YouTube help suggestion
- ⚠️ Important notes about exclusivity to bot users

## API Endpoints

### New Endpoints
- `POST /distribute-vcf` - Manually trigger VCF distribution
- `GET /vcf-status` - Get detailed VCF system status

### Enhanced Endpoints
- `GET /health` - Now includes VCF system health information

## Key Benefits

1. **Network Growth**: Users get access to all connected bot users' contacts
2. **Increased Engagement**: More contacts lead to more WhatsApp Status views
3. **Automatic Management**: Zero manual effort required from users
4. **Cross-Platform**: Works on both Android and iOS devices
5. **Privacy Conscious**: Only works for connected bot users
6. **Professional Presentation**: Friendly, informative distribution messages

## Security & Privacy

- VCF files contain only WhatsApp display names and phone numbers of connected users
- Files only work for users connected to the bot
- Automatic cleanup when users disconnect
- No sensitive data beyond basic contact information

## Scheduling Details

- **Time**: 12:00 PM Eastern Time (New York)
- **Frequency**: Daily
- **Timezone Handling**: Automatic DST adjustment
- **Delivery Method**: WhatsApp document message with custom caption

This feature significantly enhances the bot's value proposition by creating a collaborative contact-sharing network among users.