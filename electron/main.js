// electron/main.js
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

// ---------------------------
// USERDATA / CACHE FIX
// ---------------------------
let userDataPath;
if (process.platform === 'win32') {
  userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'do365_tech_app');
} else {
  userDataPath = path.join(os.homedir(), '.config', 'do365_tech_app');
}
if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
app.setPath('userData', userDataPath);

const cachePath = path.join(os.tmpdir(), 'do365_tech_cache');
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
app.commandLine.appendSwitch('disk-cache-dir', cachePath);
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// ---------------------------
// ENV MODE
// ---------------------------
const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// ---------------------------
// CREATE WINDOW
// ---------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // production mode → point to built Vite files in ../dist
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    mainWindow.webContents.openDevTools(); // optional
  }


  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => (mainWindow = null));
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
// IMPORT SERVICES
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
