"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Equipment", href: "/equipment" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#1E293B] bg-[#0A0E14]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="group flex items-center gap-3.5 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7AA2F7] via-[#7DCFFF] to-[#9D7CD8] text-[#0A0E14] shadow-[0_0_20px_rgba(122,162,247,0.35)] transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5 stroke-[2.3]" />
          </div>

          <div>
            <span className="block text-xl font-bold leading-none tracking-tight text-white">
              Aetheris
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Architectural Studio
            </span>
          </div>
        </Link>

        
        <nav className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/equipment"
                  ? pathname.startsWith("/equipment")
                  : false;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border border-[#7AA2F7]/25 bg-[#7AA2F7]/15 font-semibold text-[#7AA2F7]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

       
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl border border-[#263348] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#7AA2F7] hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-[#7AA2F7] to-[#9D7CD8] px-5 py-2.5 text-sm font-semibold text-[#0A0E14] shadow-[0_0_20px_rgba(122,162,247,0.2)] transition-all hover:brightness-110"
          >
            Register
          </Link>
        </div>

       
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#263348] text-slate-300 transition-colors hover:border-[#7AA2F7] md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

     
      {mobileMenuOpen && (
        <div className="space-y-2 border-t border-[#1E293B] bg-[#111827] px-5 py-5 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#7AA2F7]/10 hover:text-[#7AA2F7]"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2 border-t border-white/10 pt-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl border border-[#263348] px-4 py-2.5 text-center text-sm font-medium text-slate-300"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#7AA2F7] to-[#9D7CD8] px-4 py-2.5 text-center text-sm font-semibold text-[#0A0E14]"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
