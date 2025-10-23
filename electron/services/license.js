// services/license.js
const { exec } = require('child_process');
const os = require('os');
const crypto = require('crypto'); // for HMC hash
const Database = require('./database'); // adjust path to your Database class

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
    this.apiSecret = 'YOUR_SECRET_KEY'; // replace with your real secret
  }

  async getHddSerial() {
    const platform = os.platform();
    try {
      if (platform === 'win32') {
        const out = await execPromise('wmic diskdrive get SerialNumber /value');
        let m = out.match(/SerialNumber\s*=\s*(\S+)/i);
        if (m && m[1]) return m[1].trim();
        const lines = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const ln of lines) {
          if (/^[0-9A-Za-z\-_.]+$/.test(ln) && ln.length > 3) return ln;
        }
        return null;
      }

      if (platform === 'linux') {
        try {
          const mountInfo = await execPromise(`findmnt -n -o SOURCE / 2>/dev/null || echo "/dev/sda"`);
          const rootDev = (mountInfo || '/dev/sda').trim().split(/\s+/)[0];
          const ls = await execPromise(`lsblk -dn -o SERIAL ${rootDev} 2>/dev/null`);
          if (ls && ls.trim()) return ls.trim();
          const u = await execPromise(`udevadm info --query=property --name=${rootDev} 2>/dev/null | grep -E '^ID_SERIAL=' || true`);
          const mu = (u || '').match(/^ID_SERIAL=(.+)$/m);
          if (mu && mu[1]) return mu[1].trim();
        } catch (e) {}
        return null;
      }

      if (platform === 'darwin') {
        try {
          const sp = await execPromise(`system_profiler SPStorageDataType 2>/dev/null || system_profiler SPSerialATADataType 2>/dev/null`);
          let m = sp.match(/Serial Number:\s*(\S+)/i);
          if (m && m[1]) return m[1].trim();
          const uuidOut = await execPromise(`ioreg -rd1 -c IOPlatformExpertDevice | awk -F\\" '/IOPlatformUUID/ { print $(NF-1) }' 2>/dev/null || echo ""`);
          if (uuidOut && uuidOut.trim()) return `UUID:${uuidOut.trim()}`;
        } catch (e) {}
        return null;
      }

      return null;
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

    // 1. Get user email from registered table
    const user = await this.db.getRegisteredUserById(registered_id); 
    // implement getRegisteredUserById in your Database class
    if (!user) throw new Error('Registered user not found');

    const email = user.email;

    // 2. Concatenate string
    const data = `${hddSerial}${this.apiSecret}${email}Activate`;

    // 3. Create HMC key using SHA256
    const hmcKey = crypto.createHash('sha256').update(data).digest('hex');

    return hmcKey;
  }
}

module.exports = LicenseService;
