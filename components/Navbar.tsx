"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { brand, navLinks } from "@/lib/data";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide nav while hero slideshow fills the viewport
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

  // On homepage: hide entire top bar during slideshow unless menu is open
  const hideOnHero = isHome && !pastHero && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        hideOnHero
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      } ${
        scrolled || open || !isHome
          ? "bg-white/90 shadow-[0_1px_0_rgba(24,24,27,0.06)] backdrop-blur-xl"
          : "bg-gradient-to-b from-white/80 to-transparent"
      }`}
    >
      <div
        className={`mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:h-24 md:px-8 ${
          hideOnHero ? "" : "pointer-events-auto"
        }`}
      >
        <Link
          href="/"
          className="relative z-10 flex h-full max-h-full shrink-0 items-center py-2"
          aria-label="JK Photography home"
        >
          <Image
            src="/logo.png?v=logo-jk"
            alt="JK Photography Chennai"
            width={220}
            height={48}
            className="h-9 w-auto max-h-10 object-contain object-left md:h-10 md:max-h-11"
            priority
            unoptimized
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
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

        <button
          type="button"
          className="relative z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-900 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-0 bg-white transition-transform duration-500 lg:hidden ${
          open ? "translate-y-0 pointer-events-auto" : "-translate-y-full"
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-6 px-8 pt-20">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-zinc-900 transition hover:text-zinc-500"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              className="rounded-full bg-zinc-950 px-6 py-4 text-center text-sm tracking-[0.16em] text-white uppercase"
            >
              WhatsApp Inquiry
            </a>
            <a
              href={`tel:+91${brand.phones[0]}`}
              className="rounded-full border border-zinc-200 px-6 py-4 text-center text-sm tracking-[0.16em] text-zinc-800 uppercase"
            >
              {brand.phones[0]}
            </a>
          </div>
        </div>
      </div>

      {/* Floating menu button on homepage hero when bar is hidden */}
      {isHome && !pastHero && !open && (
        <button
          type="button"
          className="pointer-events-auto fixed top-5 right-5 z-[60] inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md lg:top-6 lg:right-8"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </header>
  );
}
