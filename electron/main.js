// ---------------------------
// main.js
// ---------------------------

// Required modules
const path = require('path');
const os = require('os');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');

// ---------------------------
// CROSS-PLATFORM USERDATA & CACHE FIX
// ---------------------------

// Determine a safe writable userData path
let userDataPath;
if (process.platform === 'win32') {
  // Windows: %APPDATA%\do365_tech
  userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'do365_tech_app');
} else {
  // Linux/macOS: ~/.config/do365_tech
  userDataPath = path.join(os.homedir(), '.config', 'do365_tech_app');
}

// Ensure the folder exists
if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

// Force Electron to use this writable folder
app.setPath('userData', userDataPath);

// ---------------------------
// CACHE & GPU FIXES
// ---------------------------

// Create a robust writable cache path
const cachePath = path.join(os.tmpdir(), 'do365_tech_cache'); // use tmpdir to avoid permission issues
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

// Command-line switches to avoid GPU/cache errors
app.commandLine.appendSwitch('disk-cache-dir', cachePath);
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// ---------------------------
// DEV MODE
// ---------------------------
const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// ---------------------------
// CREATE MAIN WINDOW
// ---------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'customButtonsOnHover',
    show: false,
    autoHideMenuBar: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        mainWindow.webContents.openDevTools();
        console.log(__dirname);
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------
// APP LIFECYCLE
// ---------------------------
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------------------------
// DATABASE & SERVICES
// ---------------------------
const Database = require('./database');
const AuthService = require('./services/auth');
const FileService = require('./services/file');
const LicenseService = require('./services/license');

const db = new Database();
const authService = new AuthService(db);
const fileService = new FileService(db);
const licenseService = new LicenseService(db);

// ---------------------------
// AUTH HANDLERS
// ---------------------------
ipcMain.handle('auth:login', (event, { email, password }) =>
  authService.login(email, password)
);

ipcMain.handle('auth:register', (event, userData) =>
  authService.registerLicense(userData)
);

ipcMain.handle('auth:verify-token', (event, token) =>
  authService.verifyToken(token)
);

ipcMain.handle('auth:isRegistered', async () => {
  try {
    const result = await authService.isRegistered();
    return result;
  } catch (err) {
    console.error('Error in auth:isRegistered:', err);
    return { registered: false, total: 0, success: false, error: err.message };
  }
});

ipcMain.handle('auth:isLicensed', async () => {
  try {
    const result = await authService.isLicensed();
    return result;
  } catch (err) {
    console.error('Error in auth:isLicensed:', err);
    return { registered: false, total: 0, success: false, error: err.message };
  }
});

// ---------------------------
// USER HANDLERS
// ---------------------------
ipcMain.handle('users:getAll', () => authService.getAllUsers());
ipcMain.handle('users:create', (event, userData) =>
  authService.createUser(userData)
);
ipcMain.handle('users:update', (event, { id, userData }) =>
  authService.updateUser(id, userData)
);
ipcMain.handle('users:delete', (event, id) => authService.deleteUser(id));
ipcMain.handle('getRegistrationById:getRegistrationById', (event, id) =>
  authService.getRegistrationById(id)
);

// ---------------------------
// ROLE HANDLERS
// ---------------------------
ipcMain.handle('roles:getAll', () => authService.getAllRoles());
ipcMain.handle('roles:create', (event, roleData) =>
  authService.createRole(roleData)
);
ipcMain.handle('roles:update', (event, { id, roleData }) =>
  authService.updateRole(id, roleData)
);
ipcMain.handle('roles:delete', (event, id) => authService.deleteRole(id));

// ---------------------------
// FILE HANDLERS
// ---------------------------
ipcMain.handle('files:upload', (event, { filePath, fileName, userId }) =>
  fileService.processFile(filePath, fileName, userId)
);

ipcMain.handle('files:getAll', () => fileService.getAllFiles());
ipcMain.handle('files:getUserFiles', (event, userId) =>
  fileService.getUserFiles(userId)
);
ipcMain.handle('files:updateProcessed', (e, args) =>
  console.log('args in main', args) ||
  fileService.updateProcessed(
    args.fileId,
    args.fileName,
    args.idNumber,
    args.name,
    args.finalImageBuffer,
    args.address1,
    args.address2
  )
);

ipcMain.handle('print-pdf', async (event, pdfPath) => {
  try {
    const result = await shell.openPath(pdfPath);
    if (result) throw new Error(result);
    return { success: true };
  } catch (err) {
    console.error('Error opening PDF:', err);
    return { success: false, error: err.message };
  }
});

// ---------------------------
// LICENSE HANDLERS
// ---------------------------
ipcMain.handle('get-hdd-serial', async () => {
  return await licenseService.getHddSerial();
});

ipcMain.handle('insertlicense', (event, userData) =>
  licenseService.InsertLicense(userData)
);

ipcMain.handle('generate-hmc', async (event, { registered_id, hddSerial }) =>
  licenseService.generateHmcKey(registered_id, hddSerial)
);

// ---------------------------
// DIALOG HANDLER
// ---------------------------
ipcMain.handle('dialog:showOpenDialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result;
});
