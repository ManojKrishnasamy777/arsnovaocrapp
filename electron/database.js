const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'do365_database_01.db');

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    this.db.serialize(() => {
      // Enable foreign key constraints
      this.db.run(`PRAGMA foreign_keys = ON`);

      // 1️⃣ Create user_roles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return console.error('Error creating user_roles table:', err);
      });

      // 2️⃣ Create users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_role_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_role_id) REFERENCES user_roles(id)
        )
      `, (err) => {
        if (err) return console.error('Error creating users table:', err);
      });

      // 3️⃣ Create files table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          output_path TEXT,
          file_id TEXT,
          file_name TEXT,
          address1 TEXT,
          address2 TEXT,
          extracted_text TEXT,
          processing_status TEXT DEFAULT 'pending',
          upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) return console.error('Error creating files table:', err);
      });

      // 4️⃣ Insert default roles
      this.db.run(`INSERT OR IGNORE INTO user_roles (id, name) VALUES (1, 'Admin')`);
      this.db.run(`INSERT OR IGNORE INTO user_roles (id, name) VALUES (2, 'User')`);

      // 5️⃣ Insert default users AFTER roles are inserted
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      this.db.run(`
        INSERT OR IGNORE INTO users (id, user_role_id, name, email, password)
        VALUES 
          (1, 2, 'User', 'user@do365tech.com', ?),
          (2, 1, 'Admin User', 'admin@do365tech.com', ?)
      `, [hashedPassword, hashedPassword], (err) => {
        if (err) console.error('Error inserting default users:', err);
      });
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) console.error('Database close error:', err);
        resolve();
      });
    });
  }
}

module.exports = Database;
