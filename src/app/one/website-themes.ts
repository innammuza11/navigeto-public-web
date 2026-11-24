// Theme models for the Navigeto One customer-website demo. Sample content only:
// no real agency, prices or bookings. Colours are set as CSS custom properties.
export type WebsiteTheme = {
  id: string;
  name: string;
  mood: string;
  vars: Record<string, string>;
  serif: boolean;
  heroImage: string;
};

export const WEBSITE_THEMES: WebsiteTheme[] = [
  {
    id: "editorial", name: "Editorial", mood: "Clean white pages and big photography", serif: true,
    heroImage: "/media/tour-tea-train-v1.webp",
    vars: { "--w-bg": "#ffffff", "--w-surface": "#f4f6f8", "--w-ink": "#172d40", "--w-muted": "#5e696b", "--w-accent": "#236f96", "--w-accent-ink": "#ffffff", "--w-line": "#dde3e8", "--w-hero-shade": "rgba(10,25,40,.45)" },
  },
  {
    id: "tropical", name: "Tropical", mood: "Warm sand, sea teal and coral", serif: false,
    heroImage: "/media/beach-south-coast-v1.webp",
    vars: { "--w-bg": "#fffaf3", "--w-surface": "#fbeedd", "--w-ink": "#163c3f", "--w-muted": "#5d6a66", "--w-accent": "#e0603f", "--w-accent-ink": "#ffffff", "--w-line": "#f0dcc2", "--w-hero-shade": "rgba(10,50,55,.40)" },
  },
  {
    id: "luxe", name: "Night Luxe", mood: "Dark, premium, gold details", serif: true,
    heroImage: "/media/heritage-galle-v1.webp",
    vars: { "--w-bg": "#0f1720", "--w-surface": "#18232f", "--w-ink": "#f3efe6", "--w-muted": "#b8b1a3", "--w-accent": "#c9a45c", "--w-accent-ink": "#111111", "--w-line": "#2a3644", "--w-hero-shade": "rgba(0,0,0,.55)" },
  },
  {
    id: "nature", name: "Nature", mood: "Forest green, cream and wildlife", serif: false,
    heroImage: "/media/wildlife-yala-v1.webp",
    vars: { "--w-bg": "#f7f5ee", "--w-surface": "#ebe8dc", "--w-ink": "#20352a", "--w-muted": "#5f6b60", "--w-accent": "#3f7a4f", "--w-accent-ink": "#ffffff", "--w-line": "#d9d5c4", "--w-hero-shade": "rgba(15,35,20,.45)" },
  },
];

export const SAMPLE_TOURS = [
  { name: "Culture & Tea Country", nights: 5, from: 690, image: "/media/tour-sigiriya-v1.webp", places: "Sigiriya · Kandy · Nuwara Eliya" },
  { name: "Southern Beaches", nights: 4, from: 540, image: "/media/beach-south-coast-v1.webp", places: "Galle · Mirissa · Bentota" },
  { name: "Hill Country Rail", nights: 6, from: 820, image: "/media/ella-hero-cinematic-v2.webp", places: "Kandy · Ella · Yala" },
];

export function themeById(id: string | null | undefined): WebsiteTheme {
  return WEBSITE_THEMES.find((t) => t.id === id) ?? WEBSITE_THEMES[0];
}

/** Agency name typed by a visitor: plain text, trimmed, short. */
export function cleanAgencyName(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trimStart().slice(0, 32);
}
