---
title: ShizzyBot - WhatsApp Multi-User Bot
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: apache-2.0
short_description: WhatsApp Multi-User Bot with Enhanced MongoDB Integration
---

# ShizzyBot - WhatsApp Multi-User Bot

A powerful, production-ready WhatsApp bot that supports multiple users with enhanced PostgreSQL integration and robust fallback storage.

## ✨ Features

- 🔗 **Multi-user support** with session management
- 🎯 **Auto-react** to messages and status updates
- 📺 **Status view/download** functionality  
- 🎵 **YouTube video/audio** download
- ☁️ **Session backup** with Mega.nz cloud storage
- 🗄️ **Enhanced PostgreSQL** integration with automatic fallback
- 🔄 **Automatic failover** to JSON file storage if PostgreSQL is unavailable
- 🛡️ **Production-ready** with proper error handling and monitoring

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/jionnirithvik/shizzybot
cd shizzybot
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# PostgreSQL Configuration (Primary storage)
POSTGRES_URI=postgresql://username:password@localhost:5432/shizzybot

# Optional: Disable PostgreSQL to use only file storage
DISABLE_POSTGRES=false

# Mega.nz Configuration (Session backup)
MEGA_EMAIL=your-email@example.com
MEGA_PASSWORD=your-password

# Bot Configuration
BOT_NAME=ShizzyBot
CUSTOM_PAIRING_CODE=SHIZZYBOT
```

### 3. Start the Bot
```bash
npm start
```

## 🗄️ Storage Configuration

### PostgreSQL (Recommended)

The bot uses PostgreSQL as the primary storage with automatic fallback to JSON files.

#### Setting up PostgreSQL

**Local PostgreSQL:**
1. Install PostgreSQL on your system
2. Create a database: `createdb shizzybot`
3. Update your `.env` file:
```env
POSTGRES_URI=postgresql://postgres:password@localhost:5432/shizzybot
```

**Cloud PostgreSQL (Heroku, Railway, Supabase, etc.):**
1. Create a PostgreSQL database on your preferred cloud provider
2. Get the connection string from your provider
3. Update your `.env` file:
```env
POSTGRES_URI=postgresql://username:password@hostname:port/database?sslmode=require
```

#### Example PostgreSQL URIs

**Local PostgreSQL:**
```env
POSTGRES_URI=postgresql://postgres:mypassword@localhost:5432/shizzybot
```

**Heroku Postgres:**
```env
POSTGRES_URI=postgresql://user:pass@hostname:5432/database?sslmode=require
```

**Supabase:**
```env
POSTGRES_URI=postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require
```

**Railway:**
```env
POSTGRES_URI=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
```

### File Storage (Fallback)

If PostgreSQL is unavailable, the bot automatically uses JSON file storage in `./data/users.json`.

To force file storage only:
```env
DISABLE_POSTGRES=true
```

## 🛠️ Advanced Configuration

### Connection Settings
```env
# PostgreSQL Connection Timeouts (milliseconds)
POSTGRES_CONNECT_TIMEOUT=10000
POSTGRES_IDLE_TIMEOUT=5000
POSTGRES_MAX_CONNECTIONS=20

# Database Configuration
DATABASE_NAME=shizzybot
TABLE_NAME=users
```

### Bot Settings
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Bot Identity
BOT_NAME=ShizzyBot
BOT_VERSION=1.0.0
DEFAULT_PREFIX=.

# Pairing Configuration
CUSTOM_PAIRING_CODE=SHIZZYBOT
```

## 🔧 Features Overview

### Storage System
- **Primary**: PostgreSQL with connection pooling and retry logic
- **Fallback**: JSON file storage with automatic failover
- **Monitoring**: Health checks and connection status reporting
- **Data Sync**: Seamless switching between storage methods

### Session Management
- **Local Sessions**: Stored in `./sessions/` directory
- **Cloud Backup**: Optional Mega.nz integration for session backup
- **Auto Recovery**: Restore sessions from cloud or local storage
- **Multi-User**: Support for multiple WhatsApp accounts

### Error Handling
- **Graceful Degradation**: Continues working even if PostgreSQL fails
- **Automatic Retry**: Connection retry logic with exponential backoff
- **Logging**: Comprehensive logging for debugging and monitoring
- **Failover**: Seamless fallback to file storage

## 🔍 Monitoring

The bot provides detailed status information:

- **Connection Status**: PostgreSQL connection health
- **Storage Type**: Current active storage method
- **Error Logging**: Detailed error messages and recovery actions
- **Performance**: Connection timing and retry attempts

## 📝 Usage

1. **Start Bot**: Run `npm start` to launch the server
2. **Generate Pairing Code**: POST to `/pairing-code` with phone number
3. **Scan QR**: Use the pairing code to connect WhatsApp
4. **Use Commands**: Send messages with the configured prefix (default: `.`)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is licensed under the Apache 2.0 License.

---

**Note**: All user data and settings work identically whether using PostgreSQL or file storage. The bot automatically handles storage transitions without data loss.
