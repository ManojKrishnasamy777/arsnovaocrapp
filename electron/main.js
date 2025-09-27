const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

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
    titleBarStyle: 'hiddenInset',
    show: false,
    autoHideMenuBar: true, // ✅ hides the menu bar but Alt key shows it temporarily
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Completely remove menu (optional, no Alt key)
  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------------------------
// Database and API handlers
// ---------------------------
const Database = require('./database');
const AuthService = require('./services/auth');
const FileService = require('./services/file');

const db = new Database();
const authService = new AuthService(db);
const fileService = new FileService(db);

// ---------------------------
// Auth handlers
// ---------------------------
ipcMain.handle('auth:login', (event, { email, password }) =>
  authService.login(email, password)
);

ipcMain.handle('auth:register', (event, userData) =>
  authService.register(userData)
);

ipcMain.handle('auth:verify-token', (event, token) =>
  authService.verifyToken(token)
);

// ---------------------------
// User handlers
// ---------------------------
ipcMain.handle('users:getAll', () => authService.getAllUsers());
ipcMain.handle('users:create', (event, userData) =>
  authService.createUser(userData)
);
ipcMain.handle('users:update', (event, { id, userData }) =>
  authService.updateUser(id, userData)
);
ipcMain.handle('users:delete', (event, id) => authService.deleteUser(id));

// ---------------------------
// Role handlers
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
// File handlers
// ---------------------------
ipcMain.handle('files:upload', (event, { filePath, fileName, userId }) =>
  fileService.processFile(filePath, fileName, userId)
);

ipcMain.handle('files:getAll', () => fileService.getAllFiles());
ipcMain.handle('files:getUserFiles', (event, userId) =>
  fileService.getUserFiles(userId)
);

// ---------------------------
// Dialog handler
// ---------------------------
ipcMain.handle('dialog:showOpenDialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result;
});
