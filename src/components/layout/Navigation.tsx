'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  scrolled: boolean;
}

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className={`text-2xl font-bold ${
                isScrolled ? 'text-blue-600' : 'text-white'
              }`}
            >
              EV_Taxi
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#features" scrolled={isScrolled}>Features</NavLink>
            <NavLink href="#pricing" scrolled={isScrolled}>Pricing</NavLink>
            <NavLink href="#how-it-works" scrolled={isScrolled}>How It Works</NavLink>
            <NavLink href="#faq" scrolled={isScrolled}>FAQ</NavLink>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-blue-600' : 'text-white'
              }`}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink href="#features">Features</MobileNavLink>
              <MobileNavLink href="#pricing">Pricing</MobileNavLink>
              <MobileNavLink href="#how-it-works">How It Works</MobileNavLink>
              <MobileNavLink href="#faq">FAQ</MobileNavLink>
              <button className="w-full mt-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Since these are hash links (#), we can keep them as regular <a> tags
const NavLink: React.FC<NavLinkProps> = ({ href, children, scrolled }) => (
  <a
    href={href}
    className={`text-sm font-medium transition-colors ${
      scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
    }`}
  >
    {children}
  </a>
);

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
  >
    {children}
  </a>
);

export default Navigation;