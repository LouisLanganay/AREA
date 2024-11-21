import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../../../shared/Users';

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

  const login = (newToken: string) => {
    const data: User = {
      id: '1',
      email: 'test@test.com',
      displayName: 'Test User',
      username: 'test',
      createdAt: 0,
      updatedAt: 0,
      avatarUrl: 'https://i.pinimg.com/736x/0d/80/97/0d8097710f3027186444099111c6f93f.jpg',
    };
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
