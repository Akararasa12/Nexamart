import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nexamart-beta.vercel.app";

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    }
  ];

  // Dynamic product pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      productRoutes = data.products.map((product: { slug: string }) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7
      }));
    }
  } catch {
    // Fallback static product slugs if API is unavailable
    const fallbackSlugs = [
      "aura-radiant-essence",
      "celestial-youth-elixir",
      "elysian-cleansing-balm"
    ];
    productRoutes = fallbackSlugs.map((slug) => ({
      url: `${baseUrl}/products/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));
  }

  // Dynamic blog/journal pages
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${baseUrl}/api/journals`, {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.journals)) {
      blogRoutes = data.journals.map((journal: { slug: string }) => ({
        url: `${baseUrl}/blog/${journal.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6
      }));
    }
  } catch {
    // Silently skip if journals API is unavailable
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
