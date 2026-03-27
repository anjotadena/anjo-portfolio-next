import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import logoUrl from "../../assets/logo.png";
import lightLogoUrl from "../../assets/light_logo.png";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Projects" },
  { path: "/services", label: "Services" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-lg border-b border-border" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isScrolled ? "h-16" : "h-[4.8rem]"
          }`}
        >
          <Link
            to="/"
            className="group flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Home"
          >
            <motion.div
              className="relative flex items-center"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <img
                src={logoUrl}
                alt=""
                draggable={false}
                className={`h-auto w-auto object-contain object-left transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] dark:hidden ${
                  isScrolled
                    ? "max-h-[2.35rem] sm:max-h-[2.55rem]"
                    : "max-h-[2.95rem] sm:max-h-[3.35rem]"
                }`}
              />
              <img
                src={lightLogoUrl}
                alt=""
                draggable={false}
                className={`h-auto w-auto object-contain object-left transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hidden dark:block ${
                  isScrolled
                    ? "max-h-[2.35rem] sm:max-h-[2.55rem]"
                    : "max-h-[2.95rem] sm:max-h-[3.35rem]"
                }`}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div
            className={`hidden md:flex items-center transition-[gap] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isScrolled ? "gap-6" : "gap-7"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-muted-foreground hover:text-foreground transition-colors ${
                  isScrolled ? "text-sm" : "text-base"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary"
                    layoutId="navbar-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              className="text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={isScrolled ? 24 : 28} />
              ) : (
                <Menu size={isScrolled ? 24 : 28} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-background/98 backdrop-blur-lg border-b border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.path}
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}