// frontend/src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// TypeScript interfaces
interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  highlight?: boolean;
  action?: string;
}

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks: NavLink[] = [
    { href: '/', label: 'Főoldal', icon: '🏠' },
    { href: '/services', label: 'Szolgáltatók', icon: '🔍' },
    { href: '/categories', label: 'Tanúsítványok', icon: '📋' },
    { href: '/ai-chat', label: 'AI Asszisztens', icon: '🤖' },
    { href: '/how-it-works', label: 'Hogyan működik', icon: '❓' },
  ];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // User menu items based on authentication and user type
  const getUserMenuItems = (): MenuItem[] => {
    if (!user) return [];

    const baseItems: MenuItem[] = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/messages', label: 'Üzenetek', icon: '💬' },
      { href: '/settings', label: 'Beállítások', icon: '⚙️' },
      { href: '/workspace', label: 'Projektek', icon: '🏗️' },
    ];

    // Service provider specific items
    if (user.userType === 'service_provider') {
      return [
        baseItems[0], // Dashboard
        { href: '/profile/edit', label: 'Profil szerkesztése', icon: '👤' },
        { href: '/profile/modular-editor', label: 'Moduláris szerkesztő', icon: '🎨', highlight: true },
        { href: '/orders', label: 'Megrendelések', icon: '📦' },
        baseItems[1], // Messages
        baseItems[2], // Settings
        { href: '#logout', label: 'Kijelentkezés', icon: '🚪', action: 'logout' },
      ];
    }

    // Customer specific items
    return [
      baseItems[0], // Dashboard
      { href: '/bookings', label: 'Foglalásaim', icon: '📅' },
      { href: '/workspace', label: 'Projektek', icon: '🏗️' },
      { href: '/favorites', label: 'Kedvencek', icon: '❤️' },
      baseItems[1], // Messages
      baseItems[2], // Settings
      { href: '#logout', label: 'Kijelentkezés', icon: '🚪', action: 'logout' },
    ];
  };

  const userMenuItems = getUserMenuItems();

  // Handle navigation
  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action === 'logout') {
      handleLogout();
    } else {
      navigate(item.href);
      setIsProfileOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    if (!user) return '';
    return user.userType === 'service_provider' ? 'Szolgáltató fiók' : 'Ügyfél fiók';
  };

  // Check if current path is active
  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(226, 232, 240, 1)' : 'rgba(226, 232, 240, 0.8)'}`,
          boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          height: window.innerWidth < 768 ? (isScrolled ? '60px' : '70px') : (isScrolled ? '70px' : '80px')
        }}
      >
        <div 
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: window.innerWidth < 640 ? '0 16px' : '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            transition: 'padding 0.3s ease'
          }}
        >
          
          {/* Logo Section - BAL OLDAL */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
            <button 
              onClick={() => handleNavigation('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth < 640 ? '8px' : '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div 
                style={{
                  width: window.innerWidth < 640 ? '36px' : (isScrolled ? '40px' : '48px'),
                  height: window.innerWidth < 640 ? '36px' : (isScrolled ? '40px' : '48px'),
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: window.innerWidth < 640 ? '18px' : (isScrolled ? '20px' : '24px'),
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                🎯
              </div>
              <span 
                style={{
                  fontSize: window.innerWidth < 640 ? '20px' : (isScrolled ? '24px' : '28px'),
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  transition: 'font-size 0.3s ease',
                  display: window.innerWidth < 480 ? 'none' : 'block'
                }}
              >
                Corvus
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links - KÖZÉP */}
          <div 
            style={{
              display: window.innerWidth >= 1024 ? 'flex' : 'none',
              alignItems: 'center',
              gap: '4px',
              flex: '1 1 auto',
              justifyContent: 'center',
              maxWidth: '600px'
            }}
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isScrolled ? '10px 16px' : '12px 20px',
                  borderRadius: '10px',
                  color: isActiveLink(link.href) ? 'white' : '#4a5568',
                  background: isActiveLink(link.href) ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: isScrolled ? '14px' : '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isActiveLink(link.href) ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isActiveLink(link.href) ? '0 8px 25px rgba(59, 130, 246, 0.3)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (!isActiveLink(link.href)) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveLink(link.href)) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#4a5568';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: isScrolled ? '16px' : '18px' }}>{link.icon}</span>
                <span style={{ display: window.innerWidth < 1200 ? 'none' : 'block' }}>{link.label}</span>
              </button>
            ))}
          </div>

          {/* Tablet Navigation - Shortened */}
          <div 
            style={{
              display: window.innerWidth >= 768 && window.innerWidth < 1024 ? 'flex' : 'none',
              alignItems: 'center',
              gap: '4px',
              flex: '1 1 auto',
              justifyContent: 'center'
            }}
          >
            {navLinks.slice(0, 3).map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: isActiveLink(link.href) ? 'white' : '#4a5568',
                  background: isActiveLink(link.href) ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isActiveLink(link.href) ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isActiveLink(link.href) ? '0 8px 25px rgba(59, 130, 246, 0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (!isActiveLink(link.href)) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveLink(link.href)) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#4a5568';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={link.label}
              >
                <span>{link.icon}</span>
              </button>
            ))}
          </div>

          {/* User Section - JOBB OLDAL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 auto' }}>
            {isAuthenticated && user ? (
              /* Logged In User Menu */
              <div 
                className="profile-dropdown" 
                style={{ position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: window.innerWidth < 640 ? '8px' : '12px',
                    padding: window.innerWidth < 640 ? '6px 10px' : '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <div 
                    style={{
                      width: window.innerWidth < 640 ? '32px' : '40px',
                      height: window.innerWidth < 640 ? '32px' : '40px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: window.innerWidth < 640 ? '14px' : '16px'
                    }}
                  >
                    {getUserInitials()}
                  </div>
                  {window.innerWidth >= 640 && (
                    <div style={{ textAlign: 'left', display: window.innerWidth < 768 ? 'none' : 'block' }}>
                      <div 
                        style={{
                          fontWeight: '600',
                          color: '#1a202c',
                          fontSize: '14px',
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getUserDisplayName()}
                      </div>
                      <div 
                        style={{
                          fontSize: '11px',
                          color: '#718096',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {getUserTypeDisplay()}
                      </div>
                    </div>
                  )}
                  <div 
                    style={{
                      color: '#718096',
                      transition: 'transform 0.3s ease',
                      transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: window.innerWidth < 480 ? 'none' : 'block'
                    }}
                  >
                    ▼
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: '0',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e2e8f0',
                      minWidth: window.innerWidth < 640 ? '280px' : '300px',
                      maxWidth: '90vw',
                      zIndex: 1001
                    }}
                  >
                    <div 
                      style={{
                        padding: '20px',
                        borderBottom: '1px solid #e2e8f0',
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        borderRadius: '12px 12px 0 0'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '16px' }}>
                        {getUserDisplayName()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        {getUserTypeDisplay()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                        {user.email}
                      </div>
                    </div>
                    
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuItemClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 20px',
                          color: item.highlight ? '#3b82f6' : '#4a5568',
                          background: item.highlight ? 'rgba(59, 130, 246, 0.1)' : 'none',
                          border: 'none',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: item.highlight ? '600' : 'normal'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = item.highlight ? 'rgba(59, 130, 246, 0.1)' : 'none';
                          e.currentTarget.style.color = item.highlight ? '#3b82f6' : '#4a5568';
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        {item.highlight && (
                          <span 
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              fontSize: '10px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginLeft: 'auto',
                              fontWeight: '600'
                            }}
                          >
                            ÚJ
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <div 
                style={{ 
                  display: window.innerWidth >= 640 ? 'flex' : 'none',
                  alignItems: 'center', 
                  gap: '12px' 
                }}
              >
                <button 
                  onClick={() => handleNavigation('/login')}
                  style={{
                    padding: window.innerWidth < 768 ? '8px 16px' : '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'transparent',
                    border: '2px solid #3b82f6',
                    color: '#3b82f6',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {window.innerWidth < 768 ? 'Belépés' : 'Bejelentkezés'}
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  style={{
                    padding: window.innerWidth < 768 ? '8px 16px' : '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {window.innerWidth < 768 ? 'Regiszt.' : 'Regisztráció'}
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: window.innerWidth < 1024 ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                background: isMobileMenuOpen ? 'rgba(59, 130, 246, 0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '40px',
                height: '40px'
              }}
              onMouseOver={(e) => {
                if (!isMobileMenuOpen) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isMobileMenuOpen) {
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              <svg 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  transition: 'transform 0.3s ease',
                  transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            style={{
              position: 'fixed',
              top: '100%',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            style={{
              position: 'fixed',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderTop: '1px solid #e5e7eb',
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'auto',
              zIndex: 9999,
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      color: isActiveLink(link.href) ? 'white' : '#374151',
                      background: isActiveLink(link.href) ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(243, 244, 246, 0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '16px',
                      fontWeight: '500',
                      boxShadow: isActiveLink(link.href) ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isActiveLink(link.href)) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActiveLink(link.href)) {
                        e.currentTarget.style.background = 'rgba(243, 244, 246, 0.5)';
                        e.currentTarget.style.color = '#374151';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Auth Buttons for Mobile */}
              {!user && (
                <div style={{ 
                  paddingTop: '16px', 
                  borderTop: '1px solid #e5e7eb', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px' 
                }}>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    style={{
                      width: '100%',
                      padding: '16px',
                      textAlign: 'center',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Bejelentkezés
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    style={{
                      width: '100%',
                      padding: '16px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    Regisztráció
                  </button>
                </div>
              )}

              {/* User Menu Items for Mobile */}
              {user && userMenuItems.length > 0 && (
                <div style={{ 
                  paddingTop: '16px', 
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}
                      >
                        {getUserInitials()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '16px' }}>
                          {getUserDisplayName()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {getUserTypeDisplay()}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                      {user.email}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuItemClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px 20px',
                          color: item.highlight ? '#3b82f6' : '#374151',
                          background: item.highlight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(243, 244, 246, 0.5)',
                          border: 'none',
                          borderRadius: '12px',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '16px',
                          fontWeight: item.highlight ? '600' : '500'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = item.highlight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(243, 244, 246, 0.5)';
                          e.currentTarget.style.color = item.highlight ? '#3b82f6' : '#374151';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                        {item.highlight && (
                          <span 
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              fontSize: '10px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginLeft: 'auto',
                              fontWeight: '600'
                            }}
                          >
                            ÚJ
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div 
        style={{
          height: window.innerWidth < 768 ? (isScrolled ? '60px' : '70px') : (isScrolled ? '70px' : '80px'),
          transition: 'height 0.3s ease'
        }}
      />

      {/* CSS Keyframes for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Touch targets for mobile */
          @media (max-width: 768px) {
            button, a {
              min-height: 44px;
              min-width: 44px;
            }
          }

          /* Smooth scrolling for iOS */
          @supports (-webkit-overflow-scrolling: touch) {
            .mobile-menu-content {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Focus styles for accessibility */
          button:focus, a:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .nav-link {
              border: 1px solid currentColor;
            }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;