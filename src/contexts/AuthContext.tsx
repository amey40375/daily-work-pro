
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'mitra' | 'user';
  isVerified?: boolean;
  phone?: string;
  address?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any, role: 'mitra' | 'user') => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto logout after 15 minutes of inactivity
  useEffect(() => {
    const checkActivity = () => {
      if (user && Date.now() - lastActivity > 15 * 60 * 1000) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, lastActivity]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    document.addEventListener('mousedown', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('touchstart', updateActivity);

    return () => {
      document.removeEventListener('mousedown', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Admin login
      if (email === 'id.arvinstudio@gmail.com' && password === 'Bandung123') {
        setUser({
          id: 'admin-1',
          email,
          name: 'Administrator',
          role: 'admin'
        });
        setLastActivity(Date.now());
        return true;
      }

      // Get existing users from localStorage
      const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        // Check if mitra is verified
        if (foundUser.role === 'mitra' && !foundUser.isVerified) {
          return false; // Will show verification pending message
        }

        setUser({
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          isVerified: foundUser.isVerified,
          phone: foundUser.phone,
          address: foundUser.address,
          profileImage: foundUser.profileImage
        });
        setLastActivity(Date.now());
        return true;
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any, role: 'mitra' | 'user'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
      
      // Check if email already exists
      if (users.find((u: any) => u.email === userData.email)) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role,
        isVerified: role === 'user', // Users are auto-verified, mitras need admin approval
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('dailywork_users', JSON.stringify(users));

      // If registering as mitra, add to pending approvals
      if (role === 'mitra') {
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_mitra_approvals') || '[]');
        pendingApprovals.push({
          ...newUser,
          status: 'pending'
        });
        localStorage.setItem('pending_mitra_approvals', JSON.stringify(pendingApprovals));
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setLastActivity(Date.now());
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
