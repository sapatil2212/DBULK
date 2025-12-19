"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'CLIENT_USER';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  profileImage?: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
  refreshUserData: () => Promise<UserData | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Initialize user data from localStorage on client-side
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      try {
        // Check if we have a stored user and token
        const storedUser = localStorage.getItem('userData');
        const authToken = localStorage.getItem('auth_token');
        const isAuth = localStorage.getItem('isAuthenticated');
        
        if (isAuth === 'true' && storedUser && authToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify with backend that user is still authenticated
          await refreshUserData();
        } else {
          // Clear any inconsistent state
          localStorage.removeItem('userData');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('isAuthenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isAuthenticated');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const refreshUserData = async () => {
    try {
      // Get the auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      
      // Map the API response to match our UserData interface
      const userData = {
        id: data.data.id,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        role: data.data.role,
        tenantId: data.data.tenant?.id,
        tenantName: data.data.tenant?.name,
        profileImage: data.data.profileImage,
      };
      
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userData');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isAuthenticated');
      return null;
    }
  };

  const logout = async () => {
    try {
      // Get the auth token
      const authToken = localStorage.getItem('auth_token');
      
      // Call the logout API to invalidate the session
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('userData');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isAuthenticated');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      router.push('/login');
    }
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated, 
      logout,
      updateUser,
      refreshUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
