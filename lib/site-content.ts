/**
 * Everything on the site that the studio can edit from the admin panel.
 * Defaults below are the launch copy; saved edits are deep-merged on top.
 *
 * This module is client-safe (no Node/Blob imports). Server reads/writes live
 * in ./site-content.server.ts.
 */

export type TitledText = { title: string; text: string };
export type Service = { title: string; description: string };
export type Testimonial = { quote: string; name: string; detail: string };

export type SiteContent = {
  studio: {
    name: string;
    handle: string;
    tagline: string;
    heroLine: string;
    since: string;
    years: string;
    weddings: string;
    locations: string[];
    travel: string;
  };
  contact: {
    phones: string[];
    whatsapp: string;
    email: string;
    address: string;
    mapsUrl: string;
    mapsEmbed: string;
    instagram: string;
    youtube: string;
  };
  home: {
    whyHeadline: string;
    whyText: string;
    whyPoints: TitledText[];
    craftHeadline: string;
    craftText: string;
    ctaHeadline: string;
    ctaText: string;
  };
  services: Service[];
  packages: {
    headline: string;
    startingFrom: string;
    note: string;
    detail: string;
  };
  testimonials: Testimonial[];
  about: {
    headline: string;
    body: string[];
    philosophy: TitledText[];
  };
};

export const defaultSiteContent: SiteContent = {
  studio: {
    name: "JK Photography",
    handle: "jkphotographychennai",
    tagline: "Cinematic Wedding Filmmaking Crew",
    heroLine: "Based in Chennai & Kerala — travelling worldwide.",
    since: "1987",
    years: "35+",
    weddings: "30k+",
    locations: ["Chennai", "Kerala"],
    travel: "Travelling Worldwide",
  },
  contact: {
    phones: ["9543313354", "9444240350"],
    whatsapp: "919543313354",
    email: "jkphotographychennai68@gmail.com",
    address:
      "No 4/72, Parthasarathy St, Avurikollaimedu, Manali, Chennai, Tamil Nadu 600068",
    mapsUrl:
      "https://www.google.com/maps?q=4/72+Parthasarathy+St+Avurikollaimedu+Manali+Chennai+600068",
    mapsEmbed:
      "https://www.google.com/maps?q=4/72+Parthasarathy+St,+Avurikollaimedu,+Manali,+Chennai,+Tamil+Nadu+600068&output=embed",
    instagram: "https://www.instagram.com/jkphotographychennai/?hl=en",
    youtube: "https://www.youtube.com/@jkphotographychennai",
  },
  home: {
    whyHeadline: "Lasting memories through breathtaking, soulful imagery",
    whyText:
      "We combine creativity, professionalism, and technical precision to create timeless memories. From candid photography to cinematic wedding films, we capture your unique love story with unmatched quality — across Chennai, Kerala, and destinations worldwide.",
    whyPoints: [
      {
        title: "Since 1987",
        text: "Thirty-five years of wedding craft across generations of South Indian celebrations.",
      },
      {
        title: "30k+ Weddings",
        text: "A volume of experience that shows in calm direction, ritual fluency, and decisive framing.",
      },
      {
        title: "Cinematic Crew",
        text: "Photographers and filmmakers working as one unit — stills and motion in the same visual language.",
      },
      {
        title: "Worldwide Travel",
        text: "Based in Chennai & Kerala, ready for destination weddings wherever your story unfolds.",
      },
    ],
    craftHeadline: "Stories from JK",
    craftText:
      "Premium wedding photography & filmmaking shaped by 35+ years and 30k+ celebrations. Every frame is composed to feel immersive, intimate, and endlessly rewatchable.",
    ctaHeadline: "Let's craft memories that last a lifetime",
    ctaText:
      "Share your date, venue, and vision — we'll curate the right photo & film crew for your celebration.",
  },
  services: [
    {
      title: "Wedding Photography",
      description:
        "End-to-end coverage of rituals, candid emotion, and grand celebrations — crafted with three decades of South Indian wedding fluency.",
    },
    {
      title: "Cinematic Wedding Films",
      description:
        "Story-led filmmaking with cinematic colour, sound design, and highlight reels made for the big screen and Instagram.",
    },
    {
      title: "Pre-Wedding Stories",
      description:
        "Destination and city pre-weddings across Chennai, Kerala, and beyond — styled frames that feel intimate, modern, and timeless.",
    },
    {
      title: "Bridal & Portrait Sessions",
      description:
        "Fine-art bridal portraits and family sessions with meticulous lighting, wardrobe guidance, and album-ready finishing.",
    },
    {
      title: "Traditional + Candid Crews",
      description:
        "Dedicated traditional and candid teams working in sync so every ritual and every unscripted smile is preserved.",
    },
    {
      title: "Albums & Delivery",
      description:
        "Premium album design, digital galleries, and on-time delivery — memories finished with the same care as the shoot day.",
    },
  ],
  packages: {
    headline: "Coverage that fits your celebration",
    startingFrom: "₹1,00,000",
    note: "Contact us for pricing tailored to your date, venue, guest count, and photo + film crew.",
    detail:
      "Final pricing depends on your date, venue, number of days, and the photo & film crew you need. Share your details and we'll send a custom quote.",
  },
  testimonials: [
    {
      quote:
        "Creative, professional photographers — we booked them for our marriage with complete confidence. The team felt like family on the day.",
      name: "Priya & Arjun",
      detail: "Wedding · Chennai",
    },
    {
      quote:
        "From pre-wedding to reception, everything was smooth. The candid frames and viral reels captured emotion we still rewatch.",
      name: "Nandhini S.",
      detail: "Pre-Wed + Wedding · Tamil Nadu",
    },
    {
      quote:
        "Timely workmanship and beautiful album finishing. JK Photography understood our traditions and still made every frame feel cinematic.",
      name: "Karthik & Meera",
      detail: "Destination Wedding · Kerala",
    },
    {
      quote:
        "A good environment for photography and a crew that stays calm through the chaos. Our family events and wedding coverage exceeded expectations.",
      name: "The Raman Family",
      detail: "Wedding & Family Events · Manali",
    },
  ],
  about: {
    headline: "Every love story deserves a cinematic keep.",
    body: [
      "Welcome to JK Photography — a cinematic wedding filmmaking crew rooted in Chennai since 1987. For more than three decades we have preserved the most precious moments of wedding days across Tamil Nadu, Kerala, and destinations worldwide.",
      "We specialize in timeless, emotive imagery that reflects the true essence of your love — from intimate glances to joyous celebrations. Documentary candour meets artistic portraiture so your album and film feel both honest and elevated.",
      "Our approach is personal and unobtrusive. We take time to understand your vision, then move quietly through rituals and receptions so you can stay present while we craft lasting memories.",
    ],
    philosophy: [
      {
        title: "Authenticity",
        text: "We capture your day as it unfolds — beautifully, without forcing moments.",
      },
      {
        title: "Creativity",
        text: "Every wedding is a new canvas for original frames that mirror your style.",
      },
      {
        title: "Timelessness",
        text: "Images and films designed to be treasured across generations.",
      },
    ],
  },
};

export const SITE_CONTENT_TAG = "site-content";

type Plain = Record<string, unknown>;

function isPlainObject(v: unknown): v is Plain {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge saved values over defaults so newly added fields always exist. */
export function mergeSiteContent(saved: unknown): SiteContent {
  const merge = (base: unknown, over: unknown): unknown => {
    if (over === undefined || over === null) return base;
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (isPlainObject(base)) {
      if (!isPlainObject(over)) return base;
      const out: Plain = { ...base };
      for (const k of Object.keys(base)) out[k] = merge(base[k], over[k]);
      return out;
    }
    return typeof over === typeof base ? over : base;
  };
  return merge(defaultSiteContent, saved) as SiteContent;
}

const clean = (s: unknown, max = 2000) =>
  String(s ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

const cleanList = (list: unknown, max = 200) =>
  (Array.isArray(list) ? list : [])
    .map((s) => clean(s, max))
    .filter(Boolean);

/** Trim strings, drop empty rows, keep the shape predictable. */
export function sanitizeSiteContent(c: SiteContent): SiteContent {
  const digits = (s: string) => s.replace(/[^\d]/g, "");
  return {
    studio: {
      name: clean(c.studio.name, 80) || defaultSiteContent.studio.name,
      handle: clean(c.studio.handle, 60).replace(/^@/, ""),
      tagline: clean(c.studio.tagline, 160),
      heroLine: clean(c.studio.heroLine, 200),
      since: clean(c.studio.since, 12),
      years: clean(c.studio.years, 12),
      weddings: clean(c.studio.weddings, 12),
      locations: cleanList(c.studio.locations, 40),
      travel: clean(c.studio.travel, 60),
    },
    contact: {
      phones: cleanList(c.contact.phones, 20).map(digits).filter(Boolean),
      whatsapp: digits(clean(c.contact.whatsapp, 20)),
      email: clean(c.contact.email, 120),
      address: clean(c.contact.address, 300),
      mapsUrl: clean(c.contact.mapsUrl, 600),
      mapsEmbed: clean(c.contact.mapsEmbed, 800),
      instagram: clean(c.contact.instagram, 300),
      youtube: clean(c.contact.youtube, 300),
    },
    home: {
      whyHeadline: clean(c.home.whyHeadline, 160),
      whyText: clean(c.home.whyText, 800),
      whyPoints: c.home.whyPoints
        .map((p) => ({ title: clean(p.title, 60), text: clean(p.text, 300) }))
        .filter((p) => p.title || p.text),
      craftHeadline: clean(c.home.craftHeadline, 120),
      craftText: clean(c.home.craftText, 600),
      ctaHeadline: clean(c.home.ctaHeadline, 160),
      ctaText: clean(c.home.ctaText, 400),
    },
    services: c.services
      .map((s) => ({
        title: clean(s.title, 80),
        description: clean(s.description, 400),
      }))
      .filter((s) => s.title),
    packages: {
      headline: clean(c.packages.headline, 120),
      startingFrom: clean(c.packages.startingFrom, 40),
      note: clean(c.packages.note, 400),
      detail: clean(c.packages.detail, 600),
    },
    testimonials: c.testimonials
      .map((t) => ({
        quote: clean(t.quote, 600),
        name: clean(t.name, 80),
        detail: clean(t.detail, 120),
      }))
      .filter((t) => t.quote && t.name),
    about: {
      headline: clean(c.about.headline, 160),
      body: cleanList(c.about.body, 1200),
      philosophy: c.about.philosophy
        .map((p) => ({ title: clean(p.title, 60), text: clean(p.text, 300) }))
        .filter((p) => p.title || p.text),
    },
  };
}

/** Helpers used across pages. */
export function telHref(phone: string) {
  const d = phone.replace(/[^\d]/g, "");
  return d.length > 10 ? `tel:+${d}` : `tel:+91${d}`;
}

export function displayPhone(phone: string) {
  const d = phone.replace(/[^\d]/g, "");
  return d.length > 10 ? `+${d}` : `+91 ${d}`;
}

export function waHref(whatsapp: string, text?: string) {
  const base = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
  return text ? `${base}?text=${text}` : base;
}
