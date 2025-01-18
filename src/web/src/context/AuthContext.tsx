import { createContext, useContext, useState, ReactNode } from 'react';
import { getMeResponse } from '@/interfaces/api/User';
import { getMe } from '@/api/User';
import { User } from '@/interfaces/User';
import Cookies from 'js-cookie';

/**
 * Interface representing a user account with associated token
 */
interface Account {
  user: User | null;
  token: string;
}

/**
 * Interface for decoded JWT payload
 */
interface AuthPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Interface defining the authentication context shape
 */
interface AuthContextType {
  isAuthenticated: boolean;                                    // Whether user is logged in
  token: string | null;                                       // Current JWT token
  login: (token: string) => Promise<Account>;                 // Login function
  logout: () => Promise<boolean>;                            // Logout function
  user: User | null;                                         // Current user data
  accounts: Account[];                                       // List of all accounts
  addAccount: (token: string) => void;                       // Add new account
  switchAccount: (accountId: string | undefined) => void;    // Switch between accounts
  removeAccount: (accountId: string | undefined) => void;    // Remove an account
  isCurrentAccount: (accountId: string | undefined) => boolean; // Check if account is active
}

// Create the context with null default value
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider component for authentication context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage and cookies
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const [accounts, setAccounts] = useState<Account[]>(
    localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')!) : []
  );

  /**
   * Saves accounts to state and localStorage
   */
  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  };

  /**
   * Adds a new account or updates existing one
   */
  const addAccount = async (newToken: string) => {
    // Decode JWT payload
    const [, payload] = newToken.split('.');
    const decodedPayload = JSON.parse(atob(payload)) as AuthPayload;

    // Check for existing account
    const existingAccount = accounts.find(acc => acc.user?.id === decodedPayload.id);
    if (existingAccount) {
      existingAccount.token = newToken;
      return existingAccount;
    }

    // Create new account
    const data: getMeResponse = await getMe(newToken);
    const newAccount: Account = {
      user: data,
      token: newToken
    };

    // Update accounts list
    const updatedAccounts = [...accounts.filter(acc => acc.user?.id !== data.id), newAccount];
    saveAccounts(updatedAccounts);
    return newAccount;
  };

  /**
   * Switches to a different account
   */
  const switchAccount = (accountId: string | undefined) => {
    if (!accountId) return;

    const account = accounts.find(acc => acc.user?.id === accountId);
    if (account) {
      setToken(account.token);
      setUser(account.user);
      Cookies.set('token', account.token, { expires: 1 });
      localStorage.setItem('user', JSON.stringify(account.user));
    }
  };

  /**
   * Removes an account
   */
  const removeAccount = (accountId: string | undefined) => {
    if (!accountId) return;

    const updatedAccounts = accounts.filter(acc => acc.user?.id !== accountId);
    saveAccounts(updatedAccounts);
  };

  /**
   * Checks if an account is currently active
   */
  const isCurrentAccount = (accountId: string | undefined) => {
    if (!accountId) return false;
    return user?.id === accountId;
  };

  /**
   * Handles user login
   */
  const login = async (newToken: string): Promise<Account> => {
    const account = await addAccount(newToken);
    setToken(account.token);
    setUser(account.user);
    Cookies.set('token', account.token, { expires: 1 });
    localStorage.setItem('user', JSON.stringify(account.user));
    return account;
  };

  /**
   * Handles user logout
   */
  const logout = async (): Promise<boolean> => {
    const currentAccount = accounts.find(acc => acc.user?.id === user?.id);
    const updatedAccounts = accounts.filter(acc => acc.user?.id !== user?.id);

    if (currentAccount) {
      saveAccounts(updatedAccounts);
      removeAccount(currentAccount.user?.id);
    }

    setToken(null);
    setUser(null);
    Cookies.remove('token');
    localStorage.removeItem('user');

    // Switch to another account if available
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

/**
 * Hook to use the auth context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
