import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CustomerUser, AdminUser } from '../types/ecommerce';
import { verifyAdminCredentials, changeAdminPasswordInDb } from '../services/firestoreService';

interface AuthContextType {
  customer: CustomerUser | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loginCustomer: (phoneOrEmail: string, name?: string) => Promise<boolean>;
  logoutCustomer: () => void;
  loginAdminWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updateCustomerProfile: (data: Partial<CustomerUser>) => void;
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CUSTOMER_KEY = 'barakah_customer_user';
const ADMIN_SESSION_KEY = 'barakah_admin_session_v2';
const ADMIN_USER_KEY = 'barakah_admin_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (customer) {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
      } else {
        localStorage.removeItem(CUSTOMER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [customer]);

  useEffect(() => {
    try {
      if (isAdmin && adminUser) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin, adminUser]);

  // Customer Login (Phone or Email) - strictly customer role, CANNOT access /admin
  const loginCustomer = async (phoneOrEmail: string, name?: string): Promise<boolean> => {
    const isEmail = phoneOrEmail.includes('@');
    const newUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: name || (isEmail ? phoneOrEmail.split('@')[0] : 'সম্মানিত গ্রাহক'),
      phone: isEmail ? '' : phoneOrEmail,
      email: isEmail ? phoneOrEmail : undefined,
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
      isActive: true,
    };
    setCustomer(newUser);
    return true;
  };

  const logoutCustomer = () => {
    setCustomer(null);
  };

  // Secure Admin Login with Email & Password verified against Database
  const loginAdminWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await verifyAdminCredentials(email, password);
    if (res.success && res.admin) {
      setAdminUser(res.admin);
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, error: res.error || 'লগইন ব্যর্থ হয়েছে।' };
  };

  // Legacy quick PIN admin login
  const loginAdmin = (password: string): boolean => {
    const clean = password.trim();
    if (clean === 'barakah2026' || clean === 'admin123') {
      const defaultAdmin: AdminUser = {
        id: 'admin-quick',
        email: 'admin@barakahagro.com',
        name: 'Barakah Administrator',
        role: 'superadmin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setAdminUser(defaultAdmin);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const changeAdminPassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const email = adminUser?.email || 'admin@barakahagro.com';
    return await changeAdminPasswordInDb(email, oldPassword, newPassword);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
  };

  const updateCustomerProfile = (data: Partial<CustomerUser>) => {
    if (!customer) return;
    setCustomer({ ...customer, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        adminUser,
        isAdmin,
        loginCustomer,
        logoutCustomer,
        loginAdminWithCredentials,
        loginAdmin,
        logoutAdmin,
        updateCustomerProfile,
        changeAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
