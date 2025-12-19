"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Search, Moon, Sun, ChevronDown, Settings, User, LogOut, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@/lib/contexts/user-context";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, title: "Campaign completed", message: "Summer Sale campaign finished successfully", time: "2 min ago", unread: true },
    { id: 2, title: "New contacts imported", message: "1,245 contacts added to your list", time: "1 hour ago", unread: true },
    { id: 3, title: "WhatsApp connected", message: "Your device is now connected", time: "3 hours ago", unread: false },
  ];
  
  // References for click outside handling
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{
        height: '72px',
        backgroundColor: 'var(--background, #ffffff)',
        borderBottom: '1px solid var(--border, #eaeaea)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '400px' }}>
        <Search style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          color: 'var(--muted-foreground, #999)'
        }} />
        <input
          type="text"
          placeholder="Search campaigns, contacts, templates..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            fontSize: '14px',
            border: '1px solid var(--border, #eaeaea)',
            borderRadius: '12px',
            outline: 'none',
            backgroundColor: 'var(--background-secondary, #f5f5f5)',
            color: 'var(--foreground, #111)',
            transition: 'all 0.2s'
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Help */}
        <button style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <HelpCircle style={{ width: '20px', height: '20px', color: 'var(--muted-foreground, #666)' }} />
        </button>

        {/* Notifications */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell style={{ width: '20px', height: '20px', color: 'var(--muted-foreground, #666)' }} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'block'
            }}></span>
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: '0',
              top: '50px',
              width: '320px',
              backgroundColor: 'var(--background, white)',
              borderRadius: '12px',
              border: '1px solid var(--border, #eaeaea)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              zIndex: 50
            }}>
              <div style={{ 
                padding: '16px 20px',
                borderBottom: '1px solid var(--border, #eaeaea)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--foreground, #111)'
                }}>Notifications</h3>
                <button style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13px',
                  color: 'var(--muted-foreground, #666)',
                  cursor: 'pointer'
                }}>Mark all as read</button>
              </div>
              
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border, #eaeaea)',
                      backgroundColor: notification.unread ? 'var(--highlight-background, #f8fafc)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--foreground, #111)' }}>
                        {notification.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--muted-foreground, #666)' }}>{notification.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground, #666)' }}>{notification.message}</p>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#25D366',
                  cursor: 'pointer'
                }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="theme-toggle-button"
        >
          {theme === 'dark' ? (
            <Sun style={{ width: '20px', height: '20px', color: 'var(--foreground, #666)' }} />
          ) : (
            <Moon style={{ width: '20px', height: '20px', color: 'var(--foreground, #666)' }} />
          )}
        </button>

        {/* User Profile */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 6px 6px 8px',
              borderRadius: '10px',
              backgroundColor: 'var(--background-secondary, #f5f5f5)',
              border: '1px solid var(--border, #eaeaea)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600
            }}>
              {user?.firstName?.charAt(0) || 'U'}
              {user?.lastName?.charAt(0) || ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground, #111)' }}>
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted-foreground, #666)' }}>
                {user?.role === 'CLIENT_ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>
            <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--muted-foreground, #666)' }} />
          </button>
          
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: '0',
              top: '50px',
              width: '220px',
              backgroundColor: 'var(--background, white)',
              borderRadius: '12px',
              border: '1px solid var(--border, #eaeaea)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '16px 20px',
                borderBottom: '1px solid var(--border, #eaeaea)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground, #111)' }}>
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground, #666)' }}>
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>
              
              <div>
                <Link href="/settings/profile" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: 'var(--foreground, #111)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}>
                  <User style={{ width: '18px', height: '18px', color: 'var(--muted-foreground, #666)' }} />
                  Profile Settings
                </Link>
                
                <Link href="/settings" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  color: 'var(--foreground, #111)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}>
                  <Settings style={{ width: '18px', height: '18px', color: 'var(--muted-foreground, #666)' }} />
                  Account Settings
                </Link>
                
                <button 
                  onClick={() => logout()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    width: '100%',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderTop: '1px solid var(--border, #eaeaea)',
                    color: '#ef4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <LogOut style={{ width: '18px', height: '18px' }} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
