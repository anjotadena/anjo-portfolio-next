"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";

import AnjoInitialLogoSrc from "@/assets/images/initial-logo.png";
import { toSentenceCase } from "@/helpers";
import { on } from "@/utils";

type TopNavBarProps = {
  menuItems: string[];
  position: "sticky" | "fixed";
};

export const TopNavBar = ({ menuItems, position }: TopNavBarProps) => {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        ref={navbarRef}
        id="navbar"
        className={on(
          position,
          "inset-x-0 top-0 z-[60] w-full  border-b bg-white transition-all duration-300 dark:bg-default-50 lg:bg-white [&.nav-sticky]:bg-white/90 [&.nav-sticky]:shadow-md [&.nav-sticky]:backdrop-blur-3xl dark:[&.nav-sticky]:bg-default-50/80"
        )}
      >
        <div className="flex h-full items-center py-4">
          <div className="container">
            <nav className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
              <div className="flex w-full items-center lg:w-auto justify-between">
                <Link href="/">
                  <Image
                    alt="Anjo Tadena"
                    src={AnjoInitialLogoSrc}
                    height={35}
                    className="w-auto"
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-block lg:hidden"
                    onClick={toggleMobileMenu}
                  >
                    <LuMenu className="h-7 w-7 text-default-600 hover:text-default-900" />
                  </button>
                </div>
              </div>
              <ul className="menu relative mx-auto hidden grow items-center justify-end lg:flex">
                {menuItems.map((item, idx) => {
                  return (
                    <li
                      key={idx}
                      className={on(
                        "menu-item mx-2 text-default-800 transition-all duration-300 hover:text-primary [&.active]:text-primary",
                        pathname.split("/")[1] === item.toLowerCase() &&
                          "active"
                      )}
                    >
                      <Link
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium capitalize lg:text-base"
                        href={`/${item.toLowerCase()}`}
                      >
                        {toSentenceCase(item)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        className={on(
          "fixed bottom-0 left-0 top-0 z-[61] h-screen w-full border-r border-default-200 bg-white transition-all duration-300 dark:bg-default-50",
          isMobileMenuOpen 
            ? "translate-x-0" 
            : "-translate-x-full"
        )}
        tabIndex={-1}
      >
        <div className="flex h-[74px] items-center justify-end border-b border-dashed border-default-200 px-4 transition-all duration-300">
          <button onClick={closeMobileMenu} className="p-2">
            <LuX size={24} />
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <nav className="flex h-full w-full flex-col flex-wrap p-4 justify-center">
            <ul className="space-y-1">
              {menuItems.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={on(
                      "text-center menu-item mx-2 text-default-800 transition-all duration-300 hover:text-primary [&.active]:text-primary",
                      pathname.split("/")[1] === item.toLowerCase() && "active"
                    )}
                  >
                    <Link
                      className="block w-full px-4 py-2.5"
                      href={`/${item.toLowerCase()}`}
                      onClick={closeMobileMenu}
                    >
                      {toSentenceCase(item)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};
