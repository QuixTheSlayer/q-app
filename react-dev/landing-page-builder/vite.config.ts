import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { randomBytes } from 'crypto';
import { readdirSync, renameSync, rmSync, writeFileSync } from 'fs';

const ROOT = "../../public/js/landing-page-builder";
const KEEP = 3; // builds kept on disk for tabs that are still open

const buildId = Date.now().toString(36) + "-" + randomBytes(3).toString("hex");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [[
        'babel-plugin-react-compiler', {
          target: '18'
        }
      ]]
    }
  }), {
    name: "publish-build-marker",
    apply: "build",
    writeBundle() {
      // Runs only after files were written successfully (closeBundle also fires on failed builds)
      const tmp = path.join(ROOT, `current.txt.${buildId}.tmp`);
      writeFileSync(tmp, buildId);
      renameSync(tmp, path.join(ROOT, "current.txt")); // atomic switch

      // Prune old builds, newest first, touching only folders that look like build IDs
      const dirs = readdirSync(ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory() && /^[a-z0-9]+-[a-f0-9]{6}$/.test(d.name))
        .map((d) => d.name)
        .sort()
        .reverse();
      for (const name of dirs.slice(KEEP)) {
        rmSync(path.join(ROOT, name), { recursive: true, force: true });
      }
    },
  },],
  base: './',
  build: {
    emptyOutDir: true,
    cssCodeSplit: false, // one style.css, so the name below can't collide

    rollupOptions: {

      treeshake: {
        moduleSideEffects: (id, external) =>
          /node_modules[\\/](framer-motion|motion)[\\/]/.test(id) ? true : !external,
      },
      output: {
        dir: "../../public/js/landing-page-builder/",
        // manualChunks: false,
        // inlineDynamicImports: true,
        entryFileNames: `${buildId}/index.js`,
        chunkFileNames: `${buildId}/chunks/[name]-[hash].js`,

        assetFileNames: (asset) => {
          const name = asset.names?.[0] ?? (asset as any).name ?? "";
          return name.endsWith(".css")
            ? `${buildId}/style.css`
            : `${buildId}/assets/[name]-[hash][extname]`;
        },
      },
    },
  },

  server: {
    host: true,
    port: 5173,
    // The dev server never lets the browser keep a copy (also the pre-bundled packages, which are otherwise immutable).
    headers: { 'Cache-Control': 'no-store' },
    // allowedHosts:["local.newjudgify.me"],

    // useUploadToS3, convertToCanvas.ts, useHandleIMageUrl, BackgroundPicker,
    // etc. all call these two S3 endpoints with a bare relative-path axios
    // request (not through the RTK Query client, which already switches to
    // the local json-server in dev) — so on the vhost they resolve against
    // Apache/PHP on the same origin, but on Vite's own dev server
    // (localhost:5173) there's no such route and they 404. Proxy them to
    // the real backend so image upload/preview works from the Vite host too.
    proxy: {
      "/landing-page-builder/generate_upload_url": {
        target: "http://local.newjudgify.me",
        changeOrigin: true,
      },
      "/landing-page-builder/genereate_signed_url": {
        target: "http://local.newjudgify.me",
        changeOrigin: true,
      },
      // The S3 bucket's CORS policy only allows the vhost origin, not this
      // dev server's — so a direct browser PUT to the presigned upload URL
      // gets blocked by CORS here even though it works fine from the vhost.
      // useUploadToS3 rewrites the presigned URL's origin to this path (see
      // src/utils/s3DevProxy.ts) so the upload goes through this same-origin
      // proxy instead of hitting S3 directly from the browser.
      "/s3-dev-proxy": {
        target: "https://s3.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3-dev-proxy/, ''),
      },
    },

  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@components': path.resolve(__dirname, './src/components'),
    }
  },
})
