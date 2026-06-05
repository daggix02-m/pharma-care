import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function normalizeConvexUrl(rawValue) {
  if (!rawValue) {
    return "";
  }

  const value = rawValue.trim();
  if (!value || value === "your_convex_url_here") {
    return "";
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname.endsWith(".convex.site")) {
      parsed.hostname = parsed.hostname.replace(
        /\.convex\.site$/,
        ".convex.cloud",
      );
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getConvexUrlFromDeployment(deployment) {
  if (!deployment) {
    return "";
  }

  const parts = deployment.split(":");
  const deploymentName = parts[parts.length - 1]?.trim();
  if (!deploymentName || !/^[a-z0-9-]+$/i.test(deploymentName)) {
    return "";
  }

  return `https://${deploymentName}.convex.cloud`;
}

const convexUrlFromBuildEnv =
  normalizeConvexUrl(process.env.VITE_CONVEX_URL) ||
  normalizeConvexUrl(process.env.NEXT_PUBLIC_CONVEX_URL) ||
  normalizeConvexUrl(process.env.CONVEX_URL) ||
  normalizeConvexUrl(process.env.VITE_CONVEX_SITE_URL) ||
  normalizeConvexUrl(process.env.NEXT_PUBLIC_CONVEX_SITE_URL);

const convexUrlFromDeployment = getConvexUrlFromDeployment(
  process.env.CONVEX_DEPLOYMENT,
);

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@convex": path.resolve(__dirname, "convex"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-label",
            "@radix-ui/react-alert-dialog",
          ],
          icons: ["lucide-react"],
          charts: ["recharts"],
          gsap: ["gsap"],
          utils: ["clsx", "tailwind-merge", "date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["recharts", "lucide-react"],
  },
  define: {
    __CONVEX_URL_FROM_BUILD_ENV__: JSON.stringify(convexUrlFromBuildEnv),
    __CONVEX_URL_FROM_DEPLOYMENT__: JSON.stringify(convexUrlFromDeployment),
  },
});
