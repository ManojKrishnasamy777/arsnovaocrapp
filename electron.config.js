const path = require('path');

module.exports = {
  appId: 'com.yourcompany.PMJAY-CMCHIS-ocr',
  productName: 'PMJAY-CMCHIS',

  // Copyright info
  copyright: '© 2025 Do365 Technologies Pvt Ltd. All rights reserved.',

  directories: {
    output: 'dist-app',
    buildResources: 'assets',
  },

  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    'public/**/*',
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
    // ✅ Use these instead of companyName
    publisherName: 'Do365 Technologies Pvt Ltd', 
    legalTrademarks: 'PMJAY-CMCHIS is a product of Do365 Technologies Pvt Ltd',
  },

  linux: {
    target: ['AppImage'],
    defaultArch: 'x64',
    category: 'Utility',
  },

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
