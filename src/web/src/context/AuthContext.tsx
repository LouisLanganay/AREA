import { createContext, useContext, useState, ReactNode } from 'react';
import { getMeResponse } from '@/interfaces/api/User';
import { getMe } from '@/api/User';
import { User } from '@/interfaces/User';

interface Account {
  user: User | null;
  token: string;
}

interface AuthPayload {
  id: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => Promise<Account>;
  logout: () => Promise<boolean>;
  user: User | null;
  accounts: Account[];
  addAccount: (token: string) => void;
  switchAccount: (accountId: string | undefined) => void;
  removeAccount: (accountId: string | undefined) => void;
  isCurrentAccount: (accountId: string | undefined) => boolean;
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
    const [_, payload, __] = newToken.split('.');
    const decodedPayload = JSON.parse(atob(payload)) as AuthPayload;

    const existingAccount = accounts.find(acc => acc.user?.id === decodedPayload.id);
    if (existingAccount)
      return existingAccount;

    const data: getMeResponse = await getMe(newToken);
    const newAccount: Account = {
      user: data,
      token: newToken
    };

    const updatedAccounts = [...accounts.filter(acc => acc.user?.id !== data.id), newAccount];
    saveAccounts(updatedAccounts);
    return newAccount;
  };

  const switchAccount = (accountId: string | undefined) => {
    if (!accountId)
      return;

    const account = accounts.find(acc => acc.user?.id === accountId);
    if (account) {
      setToken(account.token);
      setUser(account.user);
      localStorage.setItem('token', account.token);
      localStorage.setItem('user', JSON.stringify(account.user));
    }
  };

  const removeAccount = (accountId: string | undefined) => {
    if (!accountId)
      return;

    const updatedAccounts = accounts.filter(acc => acc.user?.id !== accountId);
    saveAccounts(updatedAccounts);
  };

  const isCurrentAccount = (accountId: string | undefined) => {
    if (!accountId)
      return false;

    return user?.id === accountId;
  };

  const login = async (newToken: string): Promise<Account> => {
    const account = await addAccount(newToken);
    setToken(account.token);
    setUser(account.user);
    localStorage.setItem('token', account.token);
    localStorage.setItem('user', JSON.stringify(account.user));
    return account;
  };

  const logout = async (): Promise<boolean> => {
    const currentAccount = accounts.find(acc => acc.user?.id === user?.id);
    const updatedAccounts = accounts.filter(acc => acc.user?.id !== user?.id);
    if (currentAccount) {
      saveAccounts(updatedAccounts);
      removeAccount(currentAccount.user?.id);
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (updatedAccounts.length > 0) {
      switchAccount(updatedAccounts[0].user?.id);
      return true;
    }
    return false;
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
