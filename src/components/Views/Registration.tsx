import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoPath from '/assets/web-logo.png';



const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    mobile: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //   const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      debugger;
      const result = await window.electronAPI.registerLicense(formData);
      if (result.success) {
        alert('Registration successful!');
        if (result.userId) {
          const serial = await window.electronAPI.getHddSerial();
          let data: any = { registered_id: formData.email, hddSerial: serial };
          const hmc = await window.electronAPI.generateHmc(data);
          alert(hmc || 'Delete failed');

        }
      } else {
        alert(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#2D3A7F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl pt-10 px-10 pb-1 min-h-[500px] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-center mx-auto text-center mb-8 gap-3">
          <div className="w-25 h-26 rounded-full  mb-4">
            {/* Logo or icon */}
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000"><path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z" /></svg>      </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Registration Process</h1>
        </div>

        {/* Content/Form — grow to fill available space */}
        <div className="flex-grow">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two inputs per row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 ">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your Company Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Mobile No */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="Enter your Mobile No"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Address (Full width row) */}
              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address 
                </label>
                <textarea
                  name="address"
                  value={formData.address}

                  placeholder="Enter your Address"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6 w-1/2 mx-auto">
              {/* <button
        className="w-1/2 bg-[#a19f9f] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#616060] transition-colors"
        type="button"
      >
        Cancel
      </button> */}
              <button
                className="w-1/2 bg-[#3B4A99] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2D3A7F] transition-colors"
                type="submit"
              >
                Register
              </button>
            </div>
          </form>
        </div>




        {/* Footer stays at bottom */}
        <footer className="text-black mt-auto rounded-lg p-4">
          <div className="max-w-6xl mx-auto px-1 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} All rights reserved.
            </div>
            {/* <div className="mb-2 md:mb-0">
                    <img src={logoPath} alt="Logo" className="h-10" />
                </div> */}
            <div className="text-sm">
              <a
                href="https://do365tech.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-black hover:text-gray-500 transition-colors"
              >
                Developed
              </a>{" "}
              by DO365 Technologies
            </div>
          </div>
        </footer>
      </div>
    </div>

  );
};

export default Registration;
