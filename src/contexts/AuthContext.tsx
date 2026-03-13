import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'finance' | 'registrar' | 'adviser' | 'subject_teacher';

export interface AdvisorySection {
  section: string;
  gradeLevel: string;
  strand?: string;
}

export interface User {
  username: string;
  displayName: string;
  roles: UserRole[];
  // For adviser/teacher: linked faculty info
  facultyId: string | null;
  department: string | null;
  // Legacy single advisory (kept for backward compat)
  advisorySection: string | null;
  advisoryGradeLevel: string | null;
  // Multiple advisory sections
  advisories: AdvisorySection[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo credentials with multiple-role support
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      username: 'admin',
      displayName: 'System Admin',
      roles: ['finance', 'registrar', 'adviser', 'subject_teacher'],
      facultyId: null,
      department: null,
      advisorySection: 'Diamond',
      advisoryGradeLevel: '10',
      advisories: [
        { section: 'Diamond', gradeLevel: '10' },
        { section: 'Emerald', gradeLevel: '9' },
        { section: 'Sampaguita', gradeLevel: '7' },
        { section: 'Ruby', gradeLevel: '11', strand: 'STEM' },
        { section: 'Sapphire', gradeLevel: '12', strand: 'ABM' },
      ],
    },
  },
  registrar: {
    password: 'registrar123',
    user: {
      username: 'registrar',
      displayName: 'School Registrar',
      roles: ['registrar'],
      facultyId: null,
      department: 'Registrar Office',
      advisorySection: null,
      advisoryGradeLevel: null,
      advisories: [],
    },
  },
  adviser: {
    password: 'adviser123',
    user: {
      username: 'adviser',
      displayName: 'Mrs. Reyes',
      roles: ['adviser', 'subject_teacher'],
      facultyId: 'fac-0001',
      department: 'Mathematics',
      advisorySection: 'Diamond',
      advisoryGradeLevel: '10',
      advisories: [
        { section: 'Diamond', gradeLevel: '10' },
        { section: 'Sapphire', gradeLevel: '12', strand: 'ABM' },
      ],
    },
  },
  teacher: {
    password: 'teacher123',
    user: {
      username: 'teacher',
      displayName: 'Mr. Santos',
      roles: ['subject_teacher'],
      facultyId: 'fac-0002',
      department: 'Science',
      advisorySection: null,
      advisoryGradeLevel: null,
      advisories: [],
    },
  },
  finance: {
    password: 'finance123',
    user: {
      username: 'finance',
      displayName: 'Finance Officer',
      roles: ['finance'],
      facultyId: null,
      department: 'Finance Office',
      advisorySection: null,
      advisoryGradeLevel: null,
      advisories: [],
    },
  },
  // A registrar who is also an adviser
  registrar_adviser: {
    password: 'regadv123',
    user: {
      username: 'registrar_adviser',
      displayName: 'Ms. Cruz',
      roles: ['registrar', 'adviser', 'subject_teacher'],
      facultyId: 'fac-0003',
      department: 'English',
      advisorySection: 'Emerald',
      advisoryGradeLevel: '9',
      advisories: [
        { section: 'Emerald', gradeLevel: '9' },
        { section: 'Rosal', gradeLevel: '8' },
        { section: 'Ruby', gradeLevel: '11', strand: 'STEM' },
      ],
    },
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

  const hasRole = useCallback((role: UserRole) => {
    return user?.roles.includes(role) ?? false;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return roles.some(r => user?.roles.includes(r)) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
