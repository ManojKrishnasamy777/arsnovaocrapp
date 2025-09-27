const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor(database) {
    this.db = database;
    this.JWT_SECRET = 'your-secret-key-change-in-production';
  }

  async login(email, password) {
    try {
      const users = await this.db.query(`
        SELECT u.*, ur.name as role_name 
        FROM users u 
        JOIN user_roles ur ON u.user_role_id = ur.id 
        WHERE u.email = ?
      `, [email]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role_name 
        },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      delete user.password;

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(userData) {
    try {
      const { name, email, password, user_role_id = 2 } = userData;
      
      // Check if user already exists
      const existingUsers = await this.db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        throw new Error('User already exists');
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const result = await this.db.run(`
        INSERT INTO users (name, email, password, user_role_id) 
        VALUES (?, ?, ?, ?)
      `, [name, email, hashedPassword, user_role_id]);

      return {
        success: true,
        userId: result.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }

  async getAllUsers() {
    try {
      const users = await this.db.query(`
        SELECT u.id, u.name, u.email, u.created_at, u.updated_at, ur.name as role_name, ur.id as role_id
        FROM users u 
        JOIN user_roles ur ON u.user_role_id = ur.id 
        ORDER BY u.created_at DESC
      `);

      return {
        success: true,
        users
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createUser(userData) {
    return await this.register(userData);
  }

  async updateUser(id, userData) {
    try {
      const { name, email, user_role_id } = userData;
      
      await this.db.run(`
        UPDATE users 
        SET name = ?, email = ?, user_role_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, email, user_role_id, id]);

      return {
        success: true,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteUser(id) {
    try {
      await this.db.run('DELETE FROM users WHERE id = ?', [id]);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAllRoles() {
    try {
      const roles = await this.db.query('SELECT * FROM user_roles ORDER BY name');
      return {
        success: true,
        roles
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createRole(roleData) {
    try {
      const { name } = roleData;
      const result = await this.db.run('INSERT INTO user_roles (name) VALUES (?)', [name]);
      
      return {
        success: true,
        roleId: result.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateRole(id, roleData) {
    try {
      const { name } = roleData;
      await this.db.run('UPDATE user_roles SET name = ? WHERE id = ?', [name, id]);
      
      return {
        success: true,
        message: 'Role updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteRole(id) {
    try {
      // Check if any users are using this role
      const users = await this.db.query('SELECT id FROM users WHERE user_role_id = ?', [id]);
      if (users.length > 0) {
        throw new Error('Cannot delete role: users are assigned to this role');
      }

      await this.db.run('DELETE FROM user_roles WHERE id = ?', [id]);
      return {
        success: true,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AuthService;