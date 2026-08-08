"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { brand, navLinks } from "@/lib/data";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setPastHero(y > window.innerHeight * 0.72);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Hide top bar on homepage hero — desktop only; mobile always keeps nav visible
  const hideOnHero = isHome && !pastHero && !open;

  const mobileMenu =
    mounted && open ? (
      <div
        id="mobile-menu"
        className="fixed inset-0 z-[200] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <button
          type="button"
          className="absolute inset-0 cursor-pointer bg-zinc-950/40"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <div className="absolute top-0 right-0 left-0 max-h-[85svh] overflow-y-auto rounded-b-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <p className="text-[11px] tracking-[0.24em] text-zinc-500 uppercase">
              Menu
            </p>
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-900"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 py-3" aria-label="Mobile">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`border-b border-zinc-100 py-3.5 text-base font-medium tracking-[0.06em] uppercase transition last:border-b-0 ${
                    active
                      ? "text-zinc-950"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex gap-2 border-t border-zinc-100 px-5 py-4">
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white uppercase"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`tel:+91${brand.phones[0]}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-[11px] font-medium tracking-[0.12em] text-zinc-800 uppercase"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          hideOnHero
            ? "max-lg:translate-y-0 max-lg:opacity-100 lg:pointer-events-none lg:-translate-y-full lg:opacity-0"
            : "translate-y-0 opacity-100"
        } ${
          scrolled || open || !isHome
            ? "bg-white/95 shadow-[0_1px_0_rgba(24,24,27,0.06)] backdrop-blur-xl"
            : "bg-white/95 backdrop-blur-xl lg:bg-gradient-to-b lg:from-white/80 lg:to-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5 md:px-8 lg:h-24">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 items-center py-2"
            aria-label="JK Photography home"
          >
            <Image
              src="/logo.png?v=logo-transparent"
              alt="JK Photography Chennai"
              width={220}
              height={48}
              className="h-8 w-auto max-h-9 object-contain object-left sm:h-9 sm:max-h-10 md:h-10 md:max-h-11"
              priority
              unoptimized
            />
          </Link>

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[13px] font-medium tracking-[0.18em] text-zinc-700 uppercase transition-colors duration-300 hover:text-zinc-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:+91${brand.phones[0]}`}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-medium tracking-[0.12em] text-zinc-800 uppercase transition hover:border-zinc-400"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              Call
            </a>
            <Link
              href="/contact"
              className="rounded-full bg-zinc-950 px-5 py-2.5 text-[12px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-zinc-800"
            >
              Book Now
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={`tel:+91${brand.phones[0]}`}
              aria-label="Call JK Photography"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Always-visible mobile nav strip — Home, Films, Packages, etc. */}
        <nav
          className="border-t border-zinc-100 lg:hidden"
          aria-label="Mobile primary"
        >
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-medium tracking-[0.14em] uppercase transition sm:px-4 sm:text-[11px] sm:tracking-[0.16em] ${
                    active
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}

      {/* Desktop-only floating menu on homepage hero */}
      {isHome && !pastHero && !open && (
        <button
          type="button"
          className="pointer-events-auto fixed top-5 right-5 z-[60] hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md lg:inline-flex lg:top-6 lg:right-8"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
