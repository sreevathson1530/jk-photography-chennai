export const brand = {
  name: "JK Photography",
  handle: "jkphotographychennai",
  tagline: "Cinematic Wedding Filmmaking Crew",
  since: 1987,
  years: "35+",
  weddings: "30k+",
  locations: ["Chennai", "Kerala"],
  travel: "Travelling Worldwide",
  phones: ["9543313354", "9444240350"],
  email: "jkphotographychennai68@gmail.com",
  address:
    "No 4/72, Parthasarathy St, Avurikollaimedu, Manali, Chennai, Tamil Nadu 600068",
  mapsUrl:
    "https://www.google.com/maps?q=4/72+Parthasarathy+St+Avurikollaimedu+Manali+Chennai+600068",
  mapsEmbed:
    "https://www.google.com/maps?q=4/72+Parthasarathy+St,+Avurikollaimedu,+Manali,+Chennai,+Tamil+Nadu+600068&output=embed",
  instagram: "https://www.instagram.com/jkphotographychennai/?hl=en",
  whatsapp: "919543313354",
} as const;

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

export const services = [
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
] as const;

export const packages = [
  {
    name: "Essential",
    price: "On Request",
    badge: "Intimate",
    featured: false,
    features: [
      "1 Lead Photographer",
      "Traditional + Candid coverage",
      "Edited digital gallery",
      "Highlight teaser reel",
      "Chennai / nearby venues",
    ],
  },
  {
    name: "Signature",
    price: "On Request",
    badge: "Most Booked",
    featured: true,
    features: [
      "Photo + Film dual crew",
      "Pre-wedding half-day session",
      "Cinematic wedding film",
      "Premium designed album",
      "Same-day social reels",
      "Travel within Tamil Nadu & Kerala",
    ],
  },
  {
    name: "Legacy",
    price: "On Request",
    badge: "Destination",
    featured: false,
    features: [
      "Full cinematic production crew",
      "Multi-day wedding coverage",
      "Destination pre-wedding film",
      "Luxury album suite + canvases",
      "Drone & lighting package",
      "Worldwide travel available",
    ],
  },
] as const;

export const testimonials = [
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
] as const;

export const whyUs = [
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
] as const;

export const aboutCopy = {
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
} as const;
