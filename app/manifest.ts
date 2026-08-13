import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Navigeto Travels",
    short_name: "Navigeto",
    description: "Sri Lanka hotels, private tours, transfers, flights and tailor-made holidays.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b5674",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
