import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLicensed: false,
    isRegistered: false,
    data_id: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    const checkStoredAuth = async () => {

      const Registrationresult = await window.electronAPI.isRegistered();
      const Licensedresult = await window.electronAPI.isLicensed();

      const storedToken = localStorage.getItem('token');
      if (storedToken || Registrationresult.registered || Licensedresult.licensed) {
        try {

          if (Registrationresult.success) {
            if (Registrationresult.success && !Licensedresult.licensed) {
              setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLicensed: false,
                isRegistered: true,
                data_id: Registrationresult.data_id
              });
            } else if (Licensedresult.success && !storedToken) {
              setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLicensed: true,
                isRegistered: true,
                data_id: Registrationresult.data_id
              });
            }
            else if (storedToken && Registrationresult.registered && Licensedresult.licensed) {
              const result = await window.electronAPI.verifyToken(storedToken);
              if (result.success) {
                setAuthState({
                  user: result.user,
                  token: storedToken,
                  isAuthenticated: true,
                  isLicensed: true,
                  isRegistered: true,
                  data_id: Registrationresult.data_id
                });
              }
            }
            else {
              localStorage.removeItem('token');
            }
          }


        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {

    try {
      const result = await window.electronAPI.login({ email, password });

      if (result.success) {
        localStorage.setItem('token', result.token);
        setAuthState({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLicensed: true,
          isRegistered: true,
          data_id: 0
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLicensed: true,
      isRegistered: true,
      data_id: 0
    });
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};