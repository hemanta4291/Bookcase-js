// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "./",
  build: {
    outDir: "dist", // output directory
    rollupOptions: {
      input: {
        main: "index.html",
        favorites: "favorites.html",
        bookDetails: "book-details.html",
      },
    },
  },
  server: {
    open: true, // automatically open the app in the browser
  },
});
