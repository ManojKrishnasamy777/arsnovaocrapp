import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Arsnova OCR. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Version 1.0.0
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ by Do365 Technologies
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;