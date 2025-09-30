const path = require('path');

module.exports = {
  appId: 'com.yourcompany.PMJAY-CMCHIS-ocr',
  productName: 'PMJAY-CMCHIS',

  directories: {
    output: 'dist-app',
    buildResources: 'assets', // icons & extra resources
  },

  files: [
    'dist/**/*',           // Vite build output
    'electron/**/*',       // Electron main & preload scripts
    'package.json',
    'public/**/*',         // Include public folder and all assets
    'node_modules/**/!(concurrently|vite|eslint|typescript|tailwindcss)',
  ],

  extraResources: [
    {
      from: 'public/',
      to: 'public',
      filter: ['**/*'],
    },
  ],

  asar: true,

  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg'],
    defaultArch: 'universal',
  },

  win: {
    target: ['nsis'],
    defaultArch: 'x64',
  },

  linux: {
    target: ['AppImage'],
    defaultArch: 'x64',
    category: 'Utility',
  },

  // Icons must exist: icon.ico (win), icon.icns (mac), icon.png (linux)
  icon: path.join(__dirname, 'assets', 'icon'),

  publish: [],

  extraMetadata: {
    description: 'A desktop application for extracting text from PDF files using OCR',
    author: 'Do365 Technologies Pvt Ltd',
  },

  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
  },
};
