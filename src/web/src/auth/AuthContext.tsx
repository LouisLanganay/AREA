import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../../../shared/Users';
import { getMe_response } from '../../../shared/user/user_route';
import { getMe } from '@/api/User';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const login = async (newToken: string) => {
    const data: getMe_response = await getMe(newToken);
    console.log(data);
    setToken(newToken);
    setUser(data);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        token,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
