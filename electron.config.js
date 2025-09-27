const path = require('path');

module.exports = {
  appId: 'com.yourcompany.arsnova-ocr',
  productName: 'Arsnova OCR',

  directories: {
    output: 'dist-app',
    buildResources: 'assets' // icons & extra resources
  },

  files: [
    'dist/**/*',           // Vite build
    'electron/**/*',       // Electron main & preload
    'package.json',
    'node_modules/**/!(concurrently|vite|eslint|typescript|tailwindcss)'
  ],

  extraResources: [],

  asar: true,

  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg'],
    defaultArch: 'universal'
  },

  win: {
    target: ['nsis'],
    defaultArch: 'x64'
  },

  linux: {
    target: ['AppImage'],
    defaultArch: 'x64',
    category: 'Utility'
  },

  // Icons must exist: icon.ico (win), icon.icns (mac), icon.png (linux)
  icon: path.join(__dirname, 'assets', 'icon'),

  publish: [],

  extraMetadata: {
    description: 'A desktop application for extracting text from PDF files using OCR',
    author: 'Your Name <youremail@example.com>'
  },

  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: true
  }
};
