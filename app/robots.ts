import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://nexamart-beta.vercel.app";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout/success"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
