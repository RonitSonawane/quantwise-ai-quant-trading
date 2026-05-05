import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../api/auth';

interface AuthContextType {
  user: any;
  token: string | null;
  userType: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    fetchUser();
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const userType = user?.user_type || null;

  return (
    <AuthContext.Provider value={{ user, token, userType, loading, login, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
