import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface User {
  username: string;
  displayName: string;
  role: 'admin' | 'registrar' | 'viewer';
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo credentials for the prototype
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: { username: 'admin', displayName: 'System Admin', role: 'admin' },
  },
  registrar: {
    password: 'registrar123',
    user: { username: 'registrar', displayName: 'School Registrar', role: 'registrar' },
  },
  viewer: {
    password: 'viewer123',
    user: { username: 'viewer', displayName: 'Staff Viewer', role: 'viewer' },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('univers-auth');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((username: string, password: string) => {
    const entry = DEMO_USERS[username.toLowerCase()];
    if (!entry) {
      return { success: false, error: 'User not found' };
    }
    if (entry.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    setUser(entry.user);
    localStorage.setItem('univers-auth', JSON.stringify(entry.user));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('univers-auth');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
