import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL configuration with fallback
const getPostgresURI = () => {
  // Check for environment variable first
  if (process.env.POSTGRES_URI) {
    return process.env.POSTGRES_URI;
  }
  
  // If no env variable and not in production, allow fallback to file storage
  if (process.env.NODE_ENV !== 'production') {
    console.log("⚠️  No POSTGRES_URI provided, will use fallback storage");
    return null;
  }
  
  // In production, require explicit configuration
  console.log("⚠️  No POSTGRES_URI provided in production environment");
  return null;
};

// Connection state tracking
let pool = null;
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Connection options
const getConnectionOptions = () => {
  const uri = getPostgresURI();
  if (!uri) return null;
  
  return {
    connectionString: uri,
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECT_TIMEOUT) || 10000,
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 5000,
    max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS) || 20, // maximum number of clients in the pool
    ssl: uri.includes('localhost') ? false : { rejectUnauthorized: false }
  };
};

const ConnectDB = async (retryAttempt = 0) => {
  // Check if PostgreSQL is explicitly disabled
  if (process.env.DISABLE_POSTGRES === 'true') {
    console.log("📝 PostgreSQL explicitly disabled via DISABLE_POSTGRES=true, using fallback storage");
    throw new Error('PostgreSQL disabled');
  }

  // Get PostgreSQL configuration
  const config = getConnectionOptions();
  if (!config) {
    console.log("📝 No PostgreSQL URI configured, using fallback storage");
    throw new Error('PostgreSQL URI not configured');
  }

  // If already connected, return success
  if (isConnected && pool) {
    console.log("✅ Already connected to PostgreSQL");
    return true;
  }

  try {
    console.log(`🔄 Attempting to connect to PostgreSQL... (Attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS + 1})`);
    
    // Close existing pool if any
    if (pool) {
      await pool.end();
    }

    // Create new pool
    pool = new Pool(config);
    
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    isConnected = true;
    connectionAttempts = 0;
    
    console.log("✅ Successfully connected to PostgreSQL");
    console.log(`📊 Database: ${new URL(config.connectionString).pathname.slice(1)}`);
    console.log(`🔗 Host: ${new URL(config.connectionString).hostname}:${new URL(config.connectionString).port || 5432}`);
    console.log(`⏰ Server time: ${result.rows[0].now}`);
    
    // Set up connection event listeners
    setupConnectionListeners();
    
    // Create tables if they don't exist
    await createTables();
    
    return true;
    
  } catch (error) {
    isConnected = false;
    connectionAttempts++;
    
    console.log(`❌ PostgreSQL connection failed (Attempt ${retryAttempt + 1})`);
    console.log(`💥 Error: ${error.message}`);
    
    // Retry logic
    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return ConnectDB(retryAttempt + 1);
    }
    
    console.log("💾 Max retry attempts reached, falling back to file storage");
    throw error;
  }
};

// Create required tables
const createTables = async () => {
  if (!pool) return;
  
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(50) UNIQUE NOT NULL,
        session_id TEXT NOT NULL,
        status_read_message TEXT DEFAULT 'Your Status has been read',
        status_read_enabled BOOLEAN DEFAULT true,
        auto_react_enabled BOOLEAN DEFAULT false,
        auto_typing BOOLEAN DEFAULT false,
        auto_read BOOLEAN DEFAULT false,
        always_online BOOLEAN DEFAULT false,
        auto_recording BOOLEAN DEFAULT false,
        anti_call BOOLEAN DEFAULT false,
        anti_link BOOLEAN DEFAULT false,
        prefix VARCHAR(10) DEFAULT '.',
        status_react_notify BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const createUpdatedAtTrigger = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await pool.query(createUsersTable);
    await pool.query(createUpdatedAtTrigger);
    
    console.log("✅ Database tables and triggers created/verified");
    
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    throw error;
  }
};

// Set up connection event listeners
const setupConnectionListeners = () => {
  if (!pool) return;
  
  // Pool events
  pool.on('connect', (client) => {
    console.log('🔗 New PostgreSQL client connected');
  });

  pool.on('error', (err, client) => {
    console.log('❌ PostgreSQL pool error:', err.message);
    isConnected = false;
  });

  pool.on('remove', (client) => {
    console.log('🔌 PostgreSQL client removed');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    if (pool) {
      await pool.end();
      console.log('🔌 PostgreSQL connection pool closed through app termination');
    }
    process.exit(0);
  });
};

// Function to check if PostgreSQL is connected
export const isPostgresConnected = () => isConnected && pool !== null;

// Function to get connection status
export const getConnectionStatus = () => {
  return {
    isConnected: isConnected,
    poolSize: pool ? pool.totalCount : 0,
    idleCount: pool ? pool.idleCount : 0,
    waitingCount: pool ? pool.waitingCount : 0,
    connectionAttempts: connectionAttempts
  };
};

// Function to get database pool for queries
export const getPool = () => {
  if (!isConnected || !pool) {
    throw new Error('PostgreSQL not connected');
  }
  return pool;
};

// Function to safely disconnect
export const disconnectDB = async () => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      isConnected = false;
      console.log("🔌 Disconnected from PostgreSQL");
    }
  } catch (error) {
    console.error("❌ Error disconnecting from PostgreSQL:", error.message);
  }
};

// Function to test connection
export const testConnection = async () => {
  try {
    if (!isPostgresConnected()) {
      throw new Error('Not connected to PostgreSQL');
    }
    
    // Simple ping to test connection
    const result = await pool.query('SELECT 1 as ping');
    console.log("🏓 PostgreSQL connection test successful");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection test failed:", error.message);
    isConnected = false;
    return false;
  }
};

export default ConnectDB;
