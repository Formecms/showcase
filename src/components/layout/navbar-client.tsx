"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarClientProps {
  items: NavItem[];
  siteName: string;
}

export function NavbarClient({ items, siteName }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ocean-950/90 backdrop-blur-xl shadow-lg-dark" : "bg-transparent"
      }`}
    >
      <nav className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl text-reef-500 hover:text-reef-400 transition-colors"
        >
          {siteName.toLowerCase()}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sand-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-sand-300 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-ocean-950/95 backdrop-blur-xl border-t border-ocean-800">
          <div className="px-6 py-4 flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sand-300 hover:text-white text-base py-2 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
