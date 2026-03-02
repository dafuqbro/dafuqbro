export async function loader() {
  const text = `User-agent: *
Allow: /

Sitemap: https://dafuqbro.com/sitemap.xml
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
