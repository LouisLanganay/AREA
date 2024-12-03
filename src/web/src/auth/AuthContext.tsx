import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../../../shared/Users';
import { getMe_response } from '../../../shared/user/user_route';
import { getMe } from '@/api/User';

interface Account {
  user: User | null;
  token: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  user: User | null;
  accounts: Account[];
  addAccount: (token: string) => void;
  switchAccount: (token: string) => void;
  removeAccount: (token: string) => void;
  isCurrentAccount: (token: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const [accounts, setAccounts] = useState<Account[]>(
    localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')!) : []
  );

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  };

  const addAccount = async (newToken: string) => {
    const data: getMe_response = await getMe(newToken);
    const newAccount: Account = {
      user: data,
      token: newToken
    };

    const updatedAccounts = [...accounts.filter(acc => acc.user?.id !== data.id), newAccount];
    saveAccounts(updatedAccounts);
    return newAccount;
  };

  const switchAccount = (accountToken: string) => {
    const account = accounts.find(acc => acc.token === accountToken);
    if (account) {
      setToken(account.token);
      setUser(account.user);
      localStorage.setItem('token', account.token);
      localStorage.setItem('user', JSON.stringify(account.user));
    }
  };

  const removeAccount = (accountToken: string) => {
    const updatedAccounts = accounts.filter(acc => acc.token !== accountToken);
    saveAccounts(updatedAccounts);

    if (token === accountToken) {
      if (updatedAccounts.length > 0) {
        switchAccount(updatedAccounts[0].token);
      } else {
        logout();
      }
    }
  };

  const isCurrentAccount = (accountToken: string) => {
    return token === accountToken;
  };

  const login = async (newToken: string) => {
    const account = await addAccount(newToken);
    setToken(account.token);
    setUser(account.user);
    localStorage.setItem('token', account.token);
    localStorage.setItem('user', JSON.stringify(account.user));
  };

  const logout = () => {
    const currentAccount = accounts.find(acc => acc.token === token);
    if (currentAccount)
      removeAccount(currentAccount.token);

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
        accounts,
        addAccount,
        switchAccount,
        removeAccount,
        isCurrentAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
