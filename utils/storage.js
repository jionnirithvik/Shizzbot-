import fs from 'fs';
import path from 'path';

// Default user settings
const defaultUserSettings = {
  statusReadMessage: 'Your Status has been read',
  statusReadEnabled: true,
  autoReactEnabled: false,
  autoTyping: false,
  autoRead: false,
  alwaysOnline: false,
  autoRecording: false,
  antiCall: false,
  antilink: false,
  prefix: '.',
  statusReactNotify: true,
  displayName: null,
  vcfFileName: null,
  lastVCFUpdate: null,
};

class Storage {
  constructor() {
    this.isPostgresAvailable = false;
    this.User = null;
    this.fallbackStoragePath = './data/users.json';
    this.ensureFallbackStorage();
  }

  // Initialize PostgreSQL if available
  async initPostgreSQL(User) {
    try {
      this.User = User;
      this.isPostgresAvailable = true;
      console.log('✅ PostgreSQL storage initialized');
      
      // Test the connection with a simple operation
      await this.testConnection();
      return true;
    } catch (error) {
      console.log('❌ PostgreSQL not available, using fallback storage');
      console.log('💾 Error details:', error.message);
      this.isPostgresAvailable = false;
      return false;
    }
  }

  // Test PostgreSQL connection
  async testConnection() {
    if (!this.User) {
      throw new Error('User model not initialized');
    }
    
    // Try a simple count operation to test connection
    await this.User.countDocuments({});
    return true;
  }

  // Enhanced error handling for PostgreSQL operations
  async handlePostgresError(error, operation) {
    console.error(`❌ PostgreSQL ${operation} error:`, error.message);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
        error.message.includes('connection') || error.message.includes('timeout')) {
      console.log('🔄 PostgreSQL connection lost, switching to fallback storage');
      this.isPostgresAvailable = false;
      return false;
    }
    
    // For other errors, log but continue
    console.log('⚠️  PostgreSQL operation failed, using fallback storage for this operation');
    return false;
  }

  // Ensure fallback storage directory and file exist
  ensureFallbackStorage() {
    const dataDir = path.dirname(this.fallbackStoragePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.fallbackStoragePath)) {
      fs.writeFileSync(this.fallbackStoragePath, JSON.stringify({}), 'utf8');
    }
  }

  // Read from fallback storage
  readFallbackStorage() {
    try {
      const data = fs.readFileSync(this.fallbackStoragePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading fallback storage:', error);
      return {};
    }
  }

  // Write to fallback storage
  writeFallbackStorage(data) {
    try {
      fs.writeFileSync(this.fallbackStoragePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing to fallback storage:', error);
      return false;
    }
  }

  // Find user by phone number
  async findUser(phoneNumber) {
    if (this.isPostgresAvailable && this.User) {
      try {
        const result = await this.User.findOne({ phoneNumber });
        return result;
      } catch (error) {
        await this.handlePostgresError(error, 'findUser');
        // Fall through to file storage
      }
    }

    // Use fallback storage
    const users = this.readFallbackStorage();
    const user = users[phoneNumber];
    return user ? { phoneNumber, ...user } : null;
  }

  // Create or update user
  async createUser(phoneNumber, userData) {
    const userToCreate = {
      phoneNumber,
      ...defaultUserSettings,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isPostgresAvailable && this.User) {
      try {
        const existingUser = await this.User.findOne({ phoneNumber });
        if (existingUser) {
          const updated = await this.User.findOneAndUpdate(
            { phoneNumber },
            { ...userData, updatedAt: new Date() },
            { new: true }
          );
          return updated;
        } else {
          const created = await this.User.create(userToCreate);
          return created;
        }
      } catch (error) {
        await this.handlePostgresError(error, 'createUser');
        // Fall through to file storage
      }
    }

    // Use fallback storage
    const users = this.readFallbackStorage();
    users[phoneNumber] = userToCreate;
    this.writeFallbackStorage(users);
    return userToCreate;
  }

  // Update user
  async updateUser(phoneNumber, updates) {
    if (this.isPostgresAvailable && this.User) {
      try {
        const updated = await this.User.findOneAndUpdate(
          { phoneNumber },
          { ...updates, updatedAt: new Date() },
          { new: true }
        );
        return updated;
      } catch (error) {
        await this.handlePostgresError(error, 'updateUser');
        // Fall through to file storage
      }
    }

    // Use fallback storage
    const users = this.readFallbackStorage();
    if (users[phoneNumber]) {
      users[phoneNumber] = { ...users[phoneNumber], ...updates, updatedAt: new Date() };
      this.writeFallbackStorage(users);
      return users[phoneNumber];
    }
    return null;
  }

  // Delete user
  async deleteUser(phoneNumber) {
    if (this.isPostgresAvailable && this.User) {
      try {
        const deleted = await this.User.findOneAndDelete({ phoneNumber });
        return deleted;
      } catch (error) {
        await this.handlePostgresError(error, 'deleteUser');
        // Fall through to file storage
      }
    }

    // Use fallback storage
    const users = this.readFallbackStorage();
    if (users[phoneNumber]) {
      const deletedUser = users[phoneNumber];
      delete users[phoneNumber];
      this.writeFallbackStorage(users);
      return deletedUser;
    }
    return null;
  }

  // Get all users
  async findAllUsers() {
    if (this.isPostgresAvailable && this.User) {
      try {
        const users = await this.User.find({});
        return users;
      } catch (error) {
        await this.handlePostgresError(error, 'findAllUsers');
        // Fall through to file storage
      }
    }

    // Use fallback storage
    const users = this.readFallbackStorage();
    return Object.keys(users).map(phoneNumber => ({
      phoneNumber,
      ...users[phoneNumber]
    }));
  }

  // Get user with default settings
  async getUserWithDefaults(phoneNumber) {
    const user = await this.findUser(phoneNumber);
    if (!user) {
      return {
        phoneNumber,
        ...defaultUserSettings
      };
    }
    
    // Merge with defaults to ensure all properties exist
    return {
      ...defaultUserSettings,
      ...user
    };
  }

  // Get storage status and statistics
  getStorageStatus() {
    return {
      postgresAvailable: this.isPostgresAvailable,
      fallbackPath: this.fallbackStoragePath,
      storageType: this.isPostgresAvailable ? 'PostgreSQL' : 'File Storage'
    };
  }

  // Periodic health check for PostgreSQL connection
  async healthCheck() {
    if (this.isPostgresAvailable && this.User) {
      try {
        await this.testConnection();
        return { status: 'healthy', type: 'PostgreSQL' };
      } catch (error) {
        console.log('🔄 PostgreSQL health check failed, switching to fallback');
        this.isPostgresAvailable = false;
        return { status: 'degraded', type: 'File Storage', error: error.message };
      }
    }
    return { status: 'healthy', type: 'File Storage' };
  }
}

// Create a singleton instance
const storage = new Storage();

export default storage;