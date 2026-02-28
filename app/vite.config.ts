import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { readFileSync } from "fs";

const basePath = process.env.VITE_BASE_PATH ?? "/";

// Custom plugin to import .org files from parent directory
function orgFilesPlugin() {
  const virtualModulePrefix = 'virtual:org-files:'

  return {
    name: 'org-files-import',
    resolveId(id: string) {
      if (id.startsWith(virtualModulePrefix)) {
        return '\0' + id
      }
    },
    load(id: string) {
      if (id.startsWith('\0' + virtualModulePrefix)) {
        const filename = id.replace('\0' + virtualModulePrefix, '')
        // Resolve from parent directory (app/../)
        const filePath = resolve(__dirname, '../' + filename)
        try {
          const content = readFileSync(filePath, 'utf-8')
          return `export default ${JSON.stringify(content)}`
        } catch (e) {
          console.error(`Failed to load org file: ${filePath}`, e)
          return `export default ""`
        }
      }
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [react(), orgFilesPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  assetsInclude: ['**/*.org'],
  server: {
    open: true,
  },
  build: {
    outDir: "site",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  publicDir: false,
});
