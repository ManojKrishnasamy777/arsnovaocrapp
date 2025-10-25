// services/license.js
const { exec } = require('child_process');
const os = require('os');
const crypto = require('crypto'); // for HMC hash
const Database = require('../database'); 

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000, windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout ? stdout.toString() : '');
    });
  });
}

class LicenseService {
  constructor() {
    this.db = new Database(); // your sqlite DB wrapper
    this.apiSecret = 'a8f5f167f44f4964e6c998dee827110c'; 
  }

async getHddSerial() {
  const platform = os.platform();
  try {
    let serial = null;

    if (platform === 'win32') {
      const out = await execPromise('wmic diskdrive get SerialNumber /value');
      let m = out.match(/SerialNumber\s*=\s*(\S+)/i);
      if (m && m[1]) serial = m[1].trim();
      if (!serial) {
        const lines = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const ln of lines) {
          if (/^[0-9A-Za-z\-_.]+$/.test(ln) && ln.length > 3) {
            serial = ln;
            break;
          }
        }
      }
    }

    if (platform === 'linux') {
      try {
        const mountInfo = await execPromise(`findmnt -n -o SOURCE / 2>/dev/null || echo "/dev/sda"`);
        const rootDev = (mountInfo || '/dev/sda').trim().split(/\s+/)[0];
        const ls = await execPromise(`lsblk -dn -o SERIAL ${rootDev} 2>/dev/null`);
        if (ls && ls.trim()) serial = ls.trim();
        const u = await execPromise(`udevadm info --query=property --name=${rootDev} 2>/dev/null | grep -E '^ID_SERIAL=' || true`);
        const mu = (u || '').match(/^ID_SERIAL=(.+)$/m);
        if (mu && mu[1]) serial = mu[1].trim();
      } catch (e) {}
    }

    if (platform === 'darwin') {
      try {
        const sp = await execPromise(`system_profiler SPStorageDataType 2>/dev/null || system_profiler SPSerialATADataType 2>/dev/null`);
        let m = sp.match(/Serial Number:\s*(\S+)/i);
        if (m && m[1]) serial = m[1].trim();
        if (!serial) {
          const uuidOut = await execPromise(`ioreg -rd1 -c IOPlatformExpertDevice | awk -F\\" '/IOPlatformUUID/ { print $(NF-1) }' 2>/dev/null || echo ""`);
          if (uuidOut && uuidOut.trim()) serial = `UUID:${uuidOut.trim()}`;
        }
      } catch (e) {}
    }

    if (serial) {
      // remove _ and .
      serial = serial.replace(/[_\.]/g, '');
    }

    return serial || null;
  } catch (err) {
    return null;
  }
}


  /**
   * Generate HMC key
   * @param {number} registered_id
   * @param {string} hddSerial
   * @returns {Promise<string>} HMC key
   */
  async generateHmcKey(registered_id, hddSerial) {
    if (!registered_id || !hddSerial) throw new Error('Missing parameters');
   
console.log('Data for HMC generation:', hddSerial);

    // 2. Concatenate string
    const data = `${hddSerial}${this.apiSecret}${registered_id}Activate`;
console.log('Data for HMC generation:', data);
    // 3. Create HMC key using SHA256
const hmcKey = crypto
  .createHmac('sha256', this.apiSecret)
  .update(data)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
    return hmcKey;
  }

  async InsertLicense(userData) {
    try {
      const { system_code, license_key, registered_id } = userData;
      
      // Check if user already exists
      const existingUsers = await this.db.query('SELECT license_key FROM license WHERE license_key = ?', [license_key]);
      if (existingUsers.length > 0) {
        throw new Error('Given email already exists');
      }

      
      const result = await this.db.run(`
        INSERT INTO license (system_code, license_key, registered_id ) 
        VALUES (?, ?, ?)
      `, [system_code, license_key, registered_id ]);

      return {
        success: true,
        message: 'Activated successful',
        Id: result.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = LicenseService;
