/**
 * Generates a consistent set of meta tags for tool/quiz pages.
 * Includes: title, description, canonical, OG (full), Twitter Card, robots, breadcrumb.
 */
export function toolMeta({
  slug,
  title,
  description,
  ogImage,
}: {
  slug: string;
  title: string;
  description: string;
  ogImage: string;
}) {
  const SITE_URL = "https://dafuqbro.com";
  const SITE_NAME = "DaFuqBro";
  const url = `${SITE_URL}/${slug}`;
  const image = `${SITE_URL}${ogImage}`;

  return [
    // Basic
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },

    // Canonical
    { tagName: "link", rel: "canonical", href: url },

    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { property: "og:locale", content: "en_US" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
  ];
}

/**
 * Generates JSON-LD structured data for a quiz/tool page.
 * Returns a stringified JSON-LD blob ready for <script type="application/ld+json">.
 */
export function toolJsonLd({
  slug,
  name,
  description,
  emoji,
}: {
  slug: string;
  name: string;
  description: string;
  emoji: string;
}) {
  const SITE_URL = "https://dafuqbro.com";
  const SITE_NAME = "DaFuqBro";
  const url = `${SITE_URL}/${slug}`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Quiz",
        "@id": `${url}/#quiz`,
        name,
        description,
        url,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#org`,
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en-US",
        breadcrumb: { "@id": `${url}/#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
    ],
  });
}
