import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("shitcoin", "routes/shitcoin.tsx"),
  route("roast", "routes/roast.tsx"),
] satisfies RouteConfig;
