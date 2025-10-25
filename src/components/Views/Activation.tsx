import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoPath from '/assets/web-logo.png';
import { useLocation ,Navigate} from 'react-router-dom';


interface ActivationProps {
  id?: string; 
}

const Activation: React.FC = ({ id}) => {
  debugger
  const [formData, setFormData] = useState({
    system_code: '',
    license_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const location = useLocation();
  const routeState = location.state as { id?: string } | null;
const finalId = id || routeState?.id || ''; 

  const handleSubmit = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    setLoading(true);
    setError('');
    let SaveData : any = {};
    SaveData['license_key'] = formData.license_key;
        SaveData['system_code'] = formData.system_code;
    SaveData['registered_id'] = finalId;
    const res = await window.electronAPI.insertlicense(SaveData);

    if (!res.success) {
      setError('Invalid system_code or license_key');
    }
    else{
alert(res.message);
<Navigate to="/login" replace />
    }

    setLoading(false);
  };

    useEffect(() => {
      debugger
        const fetchSerial = async () => {
    const serial = await window.electronAPI.getHddSerial();
    if(serial){
 setFormData(prev => ({
    ...prev,          
    system_code: serial 
  }));   
 }
        }
         fetchSerial();
    },[]);
  

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
        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000"><path d="M120-160v-112q0-34 17.5-62.5T184-378q62-31 126-46.5T440-440q20 0 40 1.5t40 4.5q-4 58 21 109.5t73 84.5v80H120ZM760-40l-60-60v-186q-44-13-72-49.5T600-420q0-58 41-99t99-41q58 0 99 41t41 99q0 45-25.5 80T790-290l50 50-60 60 60 60-80 80ZM440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm300 80q17 0 28.5-11.5T780-440q0-17-11.5-28.5T740-480q-17 0-28.5 11.5T700-440q0 17 11.5 28.5T740-400Z"/></svg>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Activation</h1>
    </div>

    {/* Content/Form — grow to fill available space */}
    <div className="flex-grystem_codeow">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Activation Code
          </label>
          <input
            type="text"
            name="name"
            value={formData.system_code}
            onChange={handleChange}
            required
            readOnly
            placeholder="Activation Code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="license_key" className="block text-sm font-medium text-gray-700 mb-2">
            License Key
          </label>
          <input
            type="text"
            name="license_key"
            value={formData.license_key}
            onChange={handleChange}
            required
            placeholder="Enter your License Key"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex justify-center gap-4 mt-6 w-1/2 mx-auto">
          <button
            className="w-1/2 bg-[#a19f9f] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#616060] transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button             type="submit"
            className="w-1/2 bg-[#3B4A99] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2D3A7F] transition-colors"
          >
            Activate
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

export default Activation;
