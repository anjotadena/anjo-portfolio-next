"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { LuMenu, LuX } from "react-icons/lu";

import AnjoInitialLogoSrc from "@/assets/images/initial-logo.png";
import { toSentenceCase } from "@/helpers";
import { on } from "@/utils";

export const TopNavBar = ({
  menuItems,
  position,
}: {
  menuItems: string[];
  position: "sticky" | "fixed";
}) => {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);

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
                    className="hs-collapse-toggle inline-block lg:hidden"
                    data-hs-overlay="#mobile-menu"
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
        className="hs-overlay fixed bottom-0 left-0 top-0 z-[61] hidden h-screen w-full -translate-x-full transform border-r border-default-200 bg-white transition-all [--body-scroll:true] [--overlay-backdrop:false] hs-overlay-open:translate-x-0 dark:bg-default-50"
        tabIndex={-1}
      >
        <div className="flex h-[74px] items-center justify-end border-b border-dashed border-default-200 px-4 transition-all duration-300">
          <div data-hs-overlay="#mobile-menu" className="hs-collapse-toggle">
            <LuX size={24} />
          </div>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <nav className="hs-accordion-group flex h-full w-full flex-col flex-wrap p-4 justify-center">
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
                    <div
                      data-hs-overlay="#mobile-menu"
                      className="hs-collapse-toggle"
                    >
                      <Link
                        className="block w-full px-4 py-2.5"
                        href={`/${item.toLowerCase()}`}
                      >
                        {toSentenceCase(item)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
