import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shitcoin", "routes/shitcoin.tsx"),
  route("roast", "routes/roast.tsx"),
  route("redflags", "routes/redflags.tsx"),
  route("food", "routes/food.tsx"),
  route("energy", "routes/energy.tsx"),
  route("brainrot", "routes/brainrot.tsx"),
  route("memewars", "routes/memewars.tsx"),   // ← NEW
  // Blog
  route("blog", "routes/blog._index.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  // Admin
  route("admin/login", "routes/admin.login.tsx"),
  route("admin", "routes/admin._index.tsx"),
  route("admin/edit/:id", "routes/admin.edit.$id.tsx"),
  // SEO
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),
  route("robots.txt", "routes/robots[.]txt.tsx"),
  // API
  route("api/track", "routes/api.track.tsx"),
] satisfies RouteConfig;
