import React from "react";
import logo from '/assets/white_logo.png';

const Footer = () => {
    return (
        <footer className="bg-gray-50 text-black py-4">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                {/* Left - Year */}
                <div className="text-sm mb-2 md:mb-0">
                    &copy; {new Date().getFullYear()} All rights reserved.
                </div>

                {/* Center - Logo */}
                <div className="mb-2 md:mb-0">
                    <img src={logo} alt="Logo" className="h-10" />
                </div>

                {/* Right - Website URL */}
                <div className="text-sm">
                    {/* <a
                        href="https://do365tech.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-500 transition-colors"
                    >
                        do365tech.com
                    </a> */}

                    <p className="text-black hover:text-gray-500 transition-colors"><a href="https://do365tech.com/" rel="noopener noreferrer" target="_blank">Developed</a> by DO365 Technologies</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
