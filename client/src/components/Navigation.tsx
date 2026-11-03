import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleDarkMode } from '@/store/slices/uiSlice';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/convert', label: 'Convert' },
  { to: '/integration', label: 'Integration' },
] as const;

export default function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/[0.04] bg-background/80 backdrop-blur-sm"
      data-icod-id="src_components_navigation_tsx_db5f">
      {/* Skip-to-content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
        data-icod-id="src_components_navigation_tsx_8d81">
        Skip to content
      </a>
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
        aria-label="Main navigation"
        data-icod-id="src_components_navigation_tsx_ba1e">
        {/* Logo */}
        <Link
          to="/"
          className="font-serif text-xl tracking-tight text-foreground transition-opacity duration-200 hover:opacity-75"
          aria-label="Smart Converter home"
          data-icod-id="src_components_navigation_tsx_0a13">
          Smart Converter
        </Link>

        {/* Desktop nav links */}
        <div
          className="hidden items-center gap-2 md:flex"
          data-icod-id="src_components_navigation_tsx_0c42">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  buttonClass({ variant: 'ghost', size: 'sm' }),
                  'transition-all duration-200 ease-in-out',
                  isActive && 'text-foreground font-semibold opacity-100',
                )}
                aria-current={isActive ? 'page' : undefined}
                data-icod-id={`src_components_navigation_tsx_5d6f_${link.to}`}>
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/convert"
            className={buttonClass({ variant: 'primary', size: 'sm' })}
            data-icod-id="src_components_navigation_tsx_bf1d">
            Start Converting
          </Link>
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-2 transition-all duration-200 ease-in-out"
            data-icod-id="src_components_navigation_tsx_darkmode">
            {darkMode ? (
              <Sun
                className="h-5 w-5 transition-transform duration-200"
                data-icod-id="src_components_navigation_tsx_5140" />
            ) : (
              <Moon
                className="h-5 w-5 transition-transform duration-200"
                data-icod-id="src_components_navigation_tsx_7812" />
            )}
          </Button>
        </div>

        {/* Mobile hamburger button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobile}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          data-icod-id="src_components_navigation_tsx_1906">
          {mobileOpen ? <X className="h-5 w-5" data-icod-id="src_components_navigation_tsx_873a" /> : <Menu className="h-5 w-5" data-icod-id="src_components_navigation_tsx_2948" />}
        </Button>
      </nav>
      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          className="border-t border-black/[0.04] bg-background px-6 pb-6 pt-4 md:hidden"
          role="menu"
          data-icod-id="src_components_navigation_tsx_ad90">
          <div
            className="flex flex-col gap-2"
            data-icod-id="src_components_navigation_tsx_dc5e">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  className={cn(
                    buttonClass({ variant: 'ghost', size: 'md' }),
                    'w-full justify-start transition-all duration-200 ease-in-out',
                    isActive && 'text-foreground font-semibold opacity-100',
                  )}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  data-icod-id={`src_components_navigation_tsx_e62a_${link.to}`}>
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/convert"
              onClick={closeMobile}
              className={cn(buttonClass({ variant: 'primary', size: 'md' }), 'mt-2 w-full justify-center')}
              role="menuitem"
              data-icod-id="src_components_navigation_tsx_bd51">
              Start Converting
            </Link>
            {/* Dark mode toggle in mobile menu */}
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                handleToggleDarkMode();
                closeMobile();
              }}
              className="mt-2 w-full justify-start transition-all duration-200 ease-in-out"
              role="menuitem"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              data-icod-id="src_components_navigation_tsx_darkmode_mobile">
              {darkMode ? (
                <>
                  <Sun
                    className="mr-2 h-5 w-5"
                    data-icod-id="src_components_navigation_tsx_9a2f" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon
                    className="mr-2 h-5 w-5"
                    data-icod-id="src_components_navigation_tsx_27ae" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
