
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
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
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto logout after 15 minutes of inactivity
  useEffect(() => {
    const checkActivity = () => {
      if (user && Date.now() - lastActivity > 15 * 60 * 1000) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000);
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

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('dailywork_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('User loaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('dailywork_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      // Check for admin account
      if (email === 'id.arvinstudio@gmail.com' && password === 'admin123!@#') {
        const adminUser: AuthUser = {
          id: 'admin-001',
          email: 'id.arvinstudio@gmail.com',
          name: 'Administrator',
          role: 'admin',
          isVerified: true
        };
        
        setUser(adminUser);
        localStorage.setItem('dailywork_user', JSON.stringify(adminUser));
        setLastActivity(Date.now());
        setIsLoading(false);
        return true;
      }

      // Check localStorage for existing users
      const savedUsers = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
      const existingUser = savedUsers.find((u: any) => u.email === email && u.password === password);
      
      if (existingUser) {
        const userToLogin: AuthUser = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          phone: existingUser.phone,
          isVerified: existingUser.role === 'user' || existingUser.role === 'admin'
        };
        
        // Check if mitra is verified
        if (existingUser.role === 'mitra') {
          const approvedMitras = JSON.parse(localStorage.getItem('dailywork_approved_mitras') || '[]');
          if (!approvedMitras.includes(existingUser.id)) {
            console.log('Mitra not approved yet');
            setIsLoading(false);
            return false; // Will show verification pending message
          }
          userToLogin.isVerified = true;
        }

        setUser(userToLogin);
        localStorage.setItem('dailywork_user', JSON.stringify(userToLogin));
        setLastActivity(Date.now());
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: any, role: 'mitra' | 'user'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting registration:', { email: userData.email, role });
      
      // Check if user already exists
      const savedUsers = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
      const existingUser = savedUsers.find((u: any) => u.email === userData.email);
      
      if (existingUser) {
        setIsLoading(false);
        return false;
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        role: role,
        experience: userData.experience,
        skills: userData.skills,
        createdAt: new Date().toISOString()
      };

      savedUsers.push(newUser);
      localStorage.setItem('dailywork_users', JSON.stringify(savedUsers));

      // If registering as mitra, add to pending applications
      if (role === 'mitra') {
        const pendingApplications = JSON.parse(localStorage.getItem('dailywork_pending_mitras') || '[]');
        pendingApplications.push({
          id: newUser.id,
          userId: newUser.id,
          fullName: userData.name,
          phone: userData.phone,
          address: userData.address,
          experience: userData.experience,
          skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : [],
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('dailywork_pending_mitras', JSON.stringify(pendingApplications));
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out');
    setUser(null);
    localStorage.removeItem('dailywork_user');
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
