#!/usr/bin/env node

/**
 * ShizzyBot Startup Test
 * Tests PostgreSQL connection and fallback storage functionality
 */

import 'dotenv/config';
import connectDB, { getConnectionStatus, testConnection } from './utils/connectDB.js';
import storage from './utils/storage.js';
import User from './models/user.js';

console.log('🧪 Starting ShizzyBot Configuration Test\n');

async function testPostgreSQLConnection() {
  console.log('📡 Testing PostgreSQL Connection...');
  
  try {
    await connectDB();
    console.log('✅ PostgreSQL connection successful');
    
    // Test connection
    const connStatus = getConnectionStatus();
    console.log(`📊 Connection Status: Connected`);
    console.log(`🏠 Pool Size: ${connStatus.poolSize}`);
    console.log(`💤 Idle Connections: ${connStatus.idleCount}`);
    console.log(`⏳ Waiting Connections: ${connStatus.waitingCount}`);
    
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection failed');
    console.log(`💥 Reason: ${error.message}`);
    return false;
  }
}

async function testStorageSystem() {
  console.log('\n💾 Testing Storage System...');
  
  try {
    // Initialize storage
    const postgresConnected = await testPostgreSQLConnection();
    if (postgresConnected) {
      await storage.initPostgreSQL(User);
    }
    
    // Test storage operations
    console.log('🔧 Testing storage operations...');
    
    // Create test user
    const testUser = await storage.createUser('test_user_123', {
      sessionId: 'test_session_123',
      prefix: '!',
      autoReactEnabled: true
    });
    console.log('✅ Test user created');
    
    // Find user
    const foundUser = await storage.findUser('test_user_123');
    console.log('✅ Test user retrieved');
    
    // Update user
    const updatedUser = await storage.updateUser('test_user_123', {
      autoTyping: true
    });
    console.log('✅ Test user updated');
    
    // Get all users
    const allUsers = await storage.findAllUsers();
    console.log(`✅ Found ${allUsers.length} total users`);
    
    // Get user with defaults
    const userWithDefaults = await storage.getUserWithDefaults('test_user_123');
    console.log('✅ User with defaults retrieved');
    
    // Delete test user
    await storage.deleteUser('test_user_123');
    console.log('✅ Test user deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
    return false;
  }
}

async function testEnvironmentConfig() {
  console.log('\n⚙️  Testing Environment Configuration...');
  
  const config = {
    'PostgreSQL URI': process.env.POSTGRES_URI ? '✅ Configured' : '❌ Not set',
    'PostgreSQL Disabled': process.env.DISABLE_POSTGRES === 'true' ? '✅ Disabled' : '⚠️  Enabled',
    'Mega Email': process.env.MEGA_EMAIL ? '✅ Configured' : '❌ Not set',
    'Mega Password': process.env.MEGA_PASSWORD ? '✅ Configured' : '❌ Not set',
    'Bot Name': process.env.BOT_NAME || 'ShizzyBot (default)',
    'Custom Pairing Code': process.env.CUSTOM_PAIRING_CODE || 'SHIZZYBOT (default)',
    'Port': process.env.PORT || '3000 (default)',
    'Node Environment': process.env.NODE_ENV || 'development (default)'
  };
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

async function main() {
  try {
    // Test environment configuration
    await testEnvironmentConfig();
    
    // Test storage system
    const storageWorking = await testStorageSystem();
    
    // Get final status
    console.log('\n📋 Final Status Report:');
    const storageStatus = storage.getStorageStatus();
    const healthCheck = await storage.healthCheck();
    
    console.log(`  Storage Type: ${storageStatus.storageType}`);
    console.log(`  Storage Health: ${healthCheck.status}`);
    console.log(`  PostgreSQL Available: ${storageStatus.postgresAvailable ? '✅' : '❌'}`);
    console.log(`  Fallback Storage: ${storageStatus.fallbackPath}`);
    
    if (storageWorking) {
      console.log('\n🎉 All tests passed! ShizzyBot is ready to start.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed, but bot can still run with fallback storage.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run tests
main();