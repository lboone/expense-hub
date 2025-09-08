import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh is enabled by default in development
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable tree shaking for better dead code elimination
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        manualChunks: (id) => {
          // Dynamic chunking based on node_modules
          if (id.includes("node_modules")) {
            // Core React
            if (id.includes("react") || id.includes("react-dom")) {
              return "react";
            }
            // React Router
            if (id.includes("react-router")) {
              return "router";
            }
            // Redux ecosystem
            if (
              id.includes("@reduxjs/toolkit") ||
              id.includes("react-redux") ||
              id.includes("redux-persist")
            ) {
              return "redux";
            }
            // Radix UI components
            if (id.includes("@radix-ui")) {
              return "radix";
            }
            // Chart libraries
            if (id.includes("recharts")) {
              return "charts";
            }
            // Table utilities
            if (id.includes("@tanstack/react-table")) {
              return "table";
            }
            // Form libraries
            if (
              id.includes("react-hook-form") ||
              id.includes("@hookform/resolvers") ||
              id.includes("zod") ||
              id.includes("react-day-picker") ||
              id.includes("react-currency-input-field")
            ) {
              return "forms";
            }
            // UI utilities and icons
            if (
              id.includes("date-fns") ||
              id.includes("class-variance-authority") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("cmdk") ||
              id.includes("lucide-react") ||
              id.includes("next-themes") ||
              id.includes("nuqs") ||
              id.includes("react-countup") ||
              id.includes("react-papaparse") ||
              id.includes("sonner") ||
              id.includes("vaul")
            ) {
              return "utils";
            }
            // Default vendor chunk for other node_modules
            return "vendor";
          }
          // Route-based chunking for application code
          if (id.includes("/pages/auth/")) {
            return "auth-pages";
          }
          if (id.includes("/pages/dashboard/")) {
            return "dashboard-page";
          }
          if (id.includes("/pages/transactions/")) {
            return "transactions-page";
          }
          if (id.includes("/pages/reports/")) {
            return "reports-page";
          }
          if (id.includes("/pages/settings/")) {
            return "settings-pages";
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable minification for better compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ["console.log", "console.info", "console.debug"], // Remove specific console methods
      },
      mangle: {
        safari10: true, // Fix Safari 10 compatibility
      },
    },
    // Enable source maps for debugging (optional in production)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },
});
