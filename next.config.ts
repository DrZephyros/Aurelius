import type { NextConfig } from "next";
import { generateRaw } from "./scripts/gen-raw";

// snapshot templates / registry / bundles / skill sources as raw text for in-browser zips + code viewers
generateRaw();

const nextConfig: NextConfig = {};

export default nextConfig;
