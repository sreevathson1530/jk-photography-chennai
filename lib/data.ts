/**
 * Static navigation config. Everything editable (studio details, contact info,
 * slogans, services, packages, testimonials, about copy) lives in
 * lib/site-content.ts and is managed from the admin panel.
 */

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/films", label: "Films" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const portfolioFilters = [
  { id: "all", label: "All" },
  { id: "wedding", label: "Wedding" },
  { id: "prewed", label: "Pre-Wed" },
  { id: "bride", label: "Bride" },
  { id: "bts", label: "BTS" },
  { id: "packages", label: "Packages", href: "/packages" },
] as const;
