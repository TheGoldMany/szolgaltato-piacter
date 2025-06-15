const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  // Mock user state - replace with real auth context
  const [user, setUser] = React.useState<{name: string; type: string} | null>({
    name: "Kovács János",
    type: "service_provider"
  });

  const navLinks = [
    { href: '/', label: 'Főoldal', icon: '🏠' },
    { href: '/services', label: 'Szolgáltatók', icon: '🔍' },
    { href: '/categories', label: 'Kategóriák', icon: '📋' },
    { href: '/how-it-works', label: 'Hogyan működik', icon: '❓' },
  ];

  const userMenuItems = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/profile/edit', label: 'Profil szerkesztése', icon: '👤' },
    { href: '/profile/modular-editor', label: 'Moduláris szerkesztő', icon: '🎨', highlight: true },
    { href: '/messages', label: 'Üzenetek', icon: '💬' },
    { href: '/orders', label: 'Megrendelések', icon: '📦' },
    { href: '/settings', label: 'Beállítások', icon: '⚙️' },
    { href: '/logout', label: 'Kijelentkezés', icon: '🚪' },
  ] : [];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎯</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Corvus
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <span>{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Right Side - Auth or Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* Logged In User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.type === 'service_provider' ? 'Szolgáltató' : 'Ügyfél'}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.type === 'service_provider' ? 'Szolgáltató fiók' : 'Ügyfél fiók'}</p>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-4 py-3 text-sm transition-colors
                          ${item.highlight 
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        {item.highlight && (
                          <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            ÚJ
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <div className="hidden sm:flex items-center space-x-3">
                <a href="/login" className="btn btn-outline">
                  Bejelentkezés
                </a>
                <a href="/register" className="btn btn-primary">
                  Regisztráció
                </a>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <a href="/login" className="block w-full btn btn-outline text-center">
                    Bejelentkezés
                  </a>
                  <a href="/register" className="block w-full btn btn-primary text-center">
                    Regisztráció
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
