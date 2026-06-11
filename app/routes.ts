import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("register", "routes/register.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("game", "routes/game.tsx"),
  route("leaderboard", "routes/leaderboard.tsx"),
  route("play", "routes/play.tsx"),
  route("profile", "routes/profile.tsx"),
  route("api/random-location", "routes/api.random-location.ts"),
] satisfies RouteConfig;
