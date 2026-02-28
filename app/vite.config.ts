import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { readFileSync, readdirSync, statSync } from "fs";

const basePath = process.env.VITE_BASE_PATH ?? "/";

// Custom plugin to import root content files from parent directory
function contentFilesPlugin() {
  const orgFilesPrefix = "virtual:org-files:";
  const glossarySeedModule = "virtual:glossary-seed";
  const glossaryDetailsModule = "virtual:glossary-details";

  return {
    name: "content-files-import",
    resolveId(id: string) {
      if (
        id.startsWith(orgFilesPrefix) ||
        id === glossarySeedModule ||
        id === glossaryDetailsModule
      ) {
        return "\0" + id;
      }
    },
    load(id: string) {
      if (id.startsWith("\0" + orgFilesPrefix)) {
        const filename = id.replace("\0" + orgFilesPrefix, "");
        // Resolve from parent directory (app/../)
        const filePath = resolve(__dirname, "../" + filename);
        try {
          const content = readFileSync(filePath, "utf-8");
          return `export default ${JSON.stringify(content)}`;
        } catch (e) {
          console.error(`Failed to load org file: ${filePath}`, e);
          return `export default ""`;
        }
      }

      if (id === "\0" + glossarySeedModule) {
        const seedPath = resolve(__dirname, "../glossary/seed.de.json");
        try {
          const seed = readFileSync(seedPath, "utf-8");
          return `export default ${JSON.stringify(seed)}`;
        } catch (e) {
          console.error(`Failed to load glossary seed: ${seedPath}`, e);
          return `export default "[]"`;
        }
      }

      if (id === "\0" + glossaryDetailsModule) {
        const detailsDir = resolve(__dirname, "../glossary/details");
        const details: Record<string, string> = {};
        try {
          const files = readdirSync(detailsDir).filter((file) => file.endsWith(".md"));
          for (const file of files) {
            const fullPath = resolve(detailsDir, file);
            const info = statSync(fullPath);
            if (!info.isFile()) continue;
            const slug = file.replace(/\.md$/, "");
            details[slug] = readFileSync(fullPath, "utf-8");
          }
          return `export default ${JSON.stringify(details)}`;
        } catch (e) {
          console.error(`Failed to load glossary details directory: ${detailsDir}`, e);
          return `export default {}`;
        }
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [react(), contentFilesPlugin()],
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
