import { getPool } from '../utils/connectDB.js';

class User {
  constructor() {
    this.tableName = 'users';
  }

  // Get database pool
  getDB() {
    return getPool();
  }

  // Find user by phone number
  async findOne(query) {
    const pool = this.getDB();
    const { phoneNumber } = query;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformFromDB(result.rows[0]);
  }

  // Find user by phone number and update, or create if not exists
  async findOneAndUpdate(query, update, options = {}) {
    const pool = this.getDB();
    const { phoneNumber } = query;
    
    // Check if user exists
    const existingUser = await this.findOne(query);
    
    if (existingUser) {
      // Update existing user
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      Object.keys(update).forEach(key => {
        if (key !== 'phoneNumber') { // Don't update phone number
          const dbField = this.camelToSnake(key);
          updateFields.push(`${dbField} = $${paramIndex}`);
          updateValues.push(update[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length > 0) {
        updateValues.push(phoneNumber); // Add phone number for WHERE clause
        
        const updateQuery = `
          UPDATE users 
          SET ${updateFields.join(', ')} 
          WHERE phone_number = $${paramIndex}
          RETURNING *
        `;
        
        const result = await pool.query(updateQuery, updateValues);
        return this.transformFromDB(result.rows[0]);
      }
      
      return existingUser;
    } else if (options.upsert !== false) {
      // Create new user
      return await this.create({ phoneNumber, ...update });
    } else {
      return null;
    }
  }

  // Create new user
  async create(userData) {
    const pool = this.getDB();
    
    const fields = [
      'phone_number', 'session_id', 'status_read_message', 'status_read_enabled',
      'auto_react_enabled', 'auto_typing', 'auto_read', 'always_online',
      'auto_recording', 'anti_call', 'anti_link', 'prefix', 'status_react_notify',
      'display_name', 'vcf_file_name', 'last_vcf_update'
    ];
    
    const values = [
      userData.phoneNumber,
      userData.sessionId,
      userData.statusReadMessage || 'Your Status has been read',
      userData.statusReadEnabled !== undefined ? userData.statusReadEnabled : true,
      userData.autoReactEnabled !== undefined ? userData.autoReactEnabled : false,
      userData.autoTyping !== undefined ? userData.autoTyping : false,
      userData.autoRead !== undefined ? userData.autoRead : false,
      userData.alwaysOnline !== undefined ? userData.alwaysOnline : false,
      userData.autoRecording !== undefined ? userData.autoRecording : false,
      userData.antiCall !== undefined ? userData.antiCall : false,
      userData.antiLink !== undefined ? userData.antiLink : false,
      userData.prefix || '.',
      userData.statusReactNotify !== undefined ? userData.statusReactNotify : true,
      userData.displayName || null,
      userData.vcfFileName || null,
      userData.lastVCFUpdate || null
    ];
    
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO users (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return this.transformFromDB(result.rows[0]);
  }

  // Find all users
  async find(query = {}) {
    const pool = this.getDB();
    
    if (Object.keys(query).length === 0) {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map(row => this.transformFromDB(row));
    }
    
    // Handle specific queries if needed
    const { phoneNumber } = query;
    if (phoneNumber) {
      const user = await this.findOne(query);
      return user ? [user] : [];
    }
    
    return [];
  }

  // Delete user
  async findOneAndDelete(query) {
    const pool = this.getDB();
    const { phoneNumber } = query;
    
    const result = await pool.query(
      'DELETE FROM users WHERE phone_number = $1 RETURNING *',
      [phoneNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformFromDB(result.rows[0]);
  }

  // Count documents
  async countDocuments(query = {}) {
    const pool = this.getDB();
    
    if (Object.keys(query).length === 0) {
      const result = await pool.query('SELECT COUNT(*) FROM users');
      return parseInt(result.rows[0].count);
    }
    
    // Handle specific queries if needed
    const { phoneNumber } = query;
    if (phoneNumber) {
      const result = await pool.query(
        'SELECT COUNT(*) FROM users WHERE phone_number = $1',
        [phoneNumber]
      );
      return parseInt(result.rows[0].count);
    }
    
    return 0;
  }

  // Transform database row to application format (snake_case to camelCase)
  transformFromDB(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      sessionId: row.session_id,
      statusReadMessage: row.status_read_message,
      statusReadEnabled: row.status_read_enabled,
      autoReactEnabled: row.auto_react_enabled,
      autoTyping: row.auto_typing,
      autoRead: row.auto_read,
      alwaysOnline: row.always_online,
      autoRecording: row.auto_recording,
      antiCall: row.anti_call,
      antiLink: row.anti_link,
      prefix: row.prefix,
      statusReactNotify: row.status_react_notify,
      displayName: row.display_name,
      vcfFileName: row.vcf_file_name,
      lastVCFUpdate: row.last_vcf_update,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Convert camelCase to snake_case
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Create a singleton instance
const Users = new User();
export default Users;
