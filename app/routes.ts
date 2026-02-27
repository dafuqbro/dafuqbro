import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shitcoin", "routes/shitcoin.tsx"),
  route("roast", "routes/roast.tsx"),
  route("redflags", "routes/redflags.tsx"),
  route("food", "routes/food.tsx"),
  route("energy", "routes/energy.tsx"),
  // Blog
  route("blog", "routes/blog._index.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  // Admin
  route("admin/login", "routes/admin.login.tsx"),
  route("admin", "routes/admin._index.tsx"),
  route("admin/edit/:id", "routes/admin.edit.$id.tsx"),
] satisfies RouteConfig;
