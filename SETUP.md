# ShizzyBot Setup Guide

Welcome to ShizzyBot! This guide will help you set up your WhatsApp multi-user bot with MongoDB.

## Quick Setup

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

#### For MongoDB (Recommended)
```env
# MongoDB Atlas (Free tier available)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shizzybot?retryWrites=true&w=majority

# Or local MongoDB
MONGODB_URI=mongodb://localhost:27017/shizzybot

# Bot configuration
BOT_NAME=MyShizzyBot
CUSTOM_PAIRING_CODE=MYBOT123
```

#### For File Storage Only
```env
# Disable MongoDB to use only JSON file storage
DISABLE_MONGODB=true

# Bot configuration
BOT_NAME=MyShizzyBot
CUSTOM_PAIRING_CODE=MYBOT123
```

### 2. Test Your Configuration

Run the configuration test:
```bash
npm test
```

### 3. Start the Bot

```bash
npm start
```

## MongoDB Setup (MongoDB Atlas - Free)

1. **Create Account**: Go to https://cloud.mongodb.com/
2. **Create Cluster**: Click "Create" and select the free tier
3. **Create Database User**: 
   - Database Access → Add New Database User
   - Choose password authentication
   - Set username and password
4. **Configure Network Access**:
   - Network Access → Add IP Address
   - Add 0.0.0.0/0 for any IP (or your specific IP)
5. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your values

Example connection string:
```
mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/shizzybot?retryWrites=true&w=majority&appName=ShizzyBot
```

## Usage

### Get Pairing Code
```bash
curl -X POST http://localhost:3000/pairing-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890"}'
```

### Check Bot Status
```bash
curl http://localhost:3000/status
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Features

✅ **Multi-user support** - Connect multiple WhatsApp accounts
✅ **Auto-react** to messages and status updates  
✅ **YouTube downloader** - Download videos/audio from YouTube
✅ **Status management** - Auto-read and react to status updates
✅ **Cloud backup** - Session backup with Mega.nz
✅ **Robust storage** - MongoDB with automatic JSON fallback
✅ **Health monitoring** - Built-in health checks and status endpoints

## Troubleshooting

### MongoDB Connection Issues
- Run `npm test` to diagnose connection problems
- Check your MongoDB URI format
- Verify network access settings in MongoDB Atlas
- Ensure your IP is whitelisted

### Bot Not Starting
- Check port availability: `lsof -i :3000`
- Review logs for error messages
- Verify all dependencies: `npm install`

### Storage Issues
- Bot automatically falls back to JSON storage if MongoDB fails
- Check file permissions in the project directory
- Verify `data/` directory is writable

## Support

If you encounter issues:
1. Run `npm test` to check your configuration
2. Check the health endpoint: `curl http://localhost:3000/health`
3. Review the logs for detailed error messages

The bot is designed to be resilient and will continue working even if MongoDB is unavailable by using local JSON storage.