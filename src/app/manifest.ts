import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Navigeto Travels", short_name: "Navigeto", description: "Sri Lanka and worldwide journeys, beautifully connected.", start_url: "/", display: "standalone", background_color: "#fbfdfe", theme_color: "#071e34", icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }] };
}
