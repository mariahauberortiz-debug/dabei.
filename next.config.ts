import type { NextConfig } from "next";

// Every screen depends on who is signed in and their language, so pages are
// rendered per request (no static prerendering / cache components).
const nextConfig: NextConfig = {};

export default nextConfig;
