import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    const { data: subscription } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    await authService.signIn(email, password);
    await refreshUser();
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    phone: string
  ) {
    await authService.signUp(email, password, name, phone);
    await refreshUser();
  }

  async function signOut() {
    await authService.signOut();
    setUser(null);
  }

  async function refreshUser() {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
