import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User, type Profile } from '../services/auth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
          setProfile(data.profile || null);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setProfile(data.profile || null);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await authService.getMe();
      setProfile(data.profile || null);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
