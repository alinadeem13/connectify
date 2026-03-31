"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

interface NavItem {
  name: string;
  path: string;
}

const navItems: NavItem[] = [
  { name: "Home", path: "/" },
  // { name: "Dashboard", path: "/dashboard" },
  { name: "Login", path: "/login" },
  { name: "Signup", path: "/signup" },
  { name: "Logout", path: "/Logout" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    setIsOpen(false);
    router.push("/login");
  };

  // Close mobile menu when route changes or viewport grows to desktop.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleResize = () => media.matches && setIsOpen(false);
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);

  return (
    <nav
      className="sticky top-0 z-30 w-full bg-slate-700/80 text-white shadow-lg backdrop-blur"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-2xl font-bold">
          Connectify
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            if (item.name === "Logout") {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={handleLogout}
                  className="transition-colors hover:text-slate-200"
                >
                  {item.name}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`transition-colors hover:text-slate-200 ${isActive ? "font-semibold text-white underline underline-offset-4" : ""
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-white/10 bg-slate-900/90 backdrop-blur"
        >
          <ul className="flex flex-col px-4 py-3 space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              if (item.name === "Logout") {
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded px-2 py-2 text-left transition-colors hover:bg-slate-800/80 hover:text-white"
                    >
                      {item.name}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`block w-full rounded px-2 py-2 transition-colors hover:bg-slate-800/80 hover:text-white ${isActive ? "font-semibold text-white underline underline-offset-4" : ""
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
