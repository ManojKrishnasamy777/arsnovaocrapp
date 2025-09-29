import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Instagram, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'admin@app.com',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email) {
      setError('Please enter email');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Please enter password');
      setLoading(false);
      return;
    }

    const success = await login(formData.email, formData.password);
    
    if (!success) {
      setError('Invalid email or password');
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
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
      </div>

      {/* Background Pattern */}
      <div className="relative flex min-h-screen items-center justify-center bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-cover bg-center bg-no-repeat px-6 py-10">
        
        {/* Decorative Objects */}
        <div className="absolute left-0 top-1/2 h-full max-h-[400px] w-32 bg-gradient-to-r from-white/10 to-transparent -translate-y-1/2 rounded-r-full blur-3xl"></div>
        <div className="absolute right-0 top-0 h-64 w-64 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-32 w-32 bg-gradient-to-t from-white/10 to-transparent rounded-full blur-2xl"></div>

        {/* Main Container */}
        <div className="relative flex w-full max-w-6xl flex-col justify-between overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl lg:min-h-[600px] lg:flex-row">
          
          {/* Left Side - Branding */}
          <div className="relative hidden w-full items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 p-8 lg:flex lg:max-w-[500px] rounded-l-2xl">
            <div className="absolute inset-0 bg-black/20 rounded-l-2xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Arsnova OCR</h2>
                <p className="text-white/80">Advanced PDF Text Extraction</p>
              </div>
              
              <div className="hidden lg:block">
                <div className="w-full max-w-[300px] mx-auto">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="w-full h-48 bg-white/20 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-white/90 text-sm">Extract text from PDF files with advanced OCR technology</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-8 py-12 lg:max-w-[500px]">
            
            {/* Mobile Logo */}
            <div className="flex w-full items-center justify-center lg:hidden mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            </div>

            <div className="w-full max-w-[400px]">
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
                <p className="text-white/70">Enter your email and password to login</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="Enter Email"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder="Enter Password"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-white/30 text-white"
                    />
                    <span className="ml-2 text-white/70 text-sm">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'SIGN IN'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/70 font-semibold">OR</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="mb-8">
                <div className="flex justify-center gap-4">
                  <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Instagram size={18} />
                  </button>
                  <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Facebook size={18} />
                  </button>
                  <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Twitter size={18} />
                  </button>
                  <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-sm text-white/90 font-medium mb-2">Demo Credentials:</p>
                <p className="text-xs text-white/70">Email: admin@app.com</p>
                <p className="text-xs text-white/70">Password: admin123</p>
              </div>

              {/* Footer */}
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  © {new Date().getFullYear()} Arsnova OCR. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;