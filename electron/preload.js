const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth methods
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  register: (userData) => ipcRenderer.invoke('auth:register', userData),
  verifyToken: (token) => ipcRenderer.invoke('auth:verify-token', token),
  
  // User methods
  getAllUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (userData) => ipcRenderer.invoke('users:create', userData),
  updateUser: (id, userData) => ipcRenderer.invoke('users:update', { id, userData }),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id),
  
  // Role methods
  getAllRoles: () => ipcRenderer.invoke('roles:getAll'),
  createRole: (roleData) => ipcRenderer.invoke('roles:create', roleData),
  updateRole: (id, roleData) => ipcRenderer.invoke('roles:update', { id, roleData }),
  deleteRole: (id) => ipcRenderer.invoke('roles:delete', id),
  
  // File methods
  uploadFile: (fileData) => ipcRenderer.invoke('files:upload', fileData),
  getAllFiles: () => ipcRenderer.invoke('files:getAll'),
  getUserFiles: (userId) => ipcRenderer.invoke('files:getUserFiles', userId),
  
  // Dialog methods
  showOpenDialog: () => ipcRenderer.invoke('dialog:showOpenDialog'),
});