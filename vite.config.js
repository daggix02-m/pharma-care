import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function getConvexUrlFromDeployment(deployment) {
  if (!deployment) {
    return '';
  }

  const parts = deployment.split(':');
  const deploymentName = parts[parts.length - 1]?.trim();
  if (!deploymentName || !/^[a-z0-9-]+$/i.test(deploymentName)) {
    return '';
  }

  return `https://${deploymentName}.convex.cloud`;
}

const convexUrlFromDeployment = getConvexUrlFromDeployment(
  process.env.CONVEX_DEPLOYMENT,
);

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@convex': path.resolve(__dirname, 'convex'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            'lucide-react',
          ],
          charts: ['recharts'],
          utils: ['clsx', 'tailwind-merge', 'date-fns', 'gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['recharts', 'lucide-react'],
  },
  define: {
    __CONVEX_URL_FROM_DEPLOYMENT__: JSON.stringify(convexUrlFromDeployment),
  },
});
