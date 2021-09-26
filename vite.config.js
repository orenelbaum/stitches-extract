import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
      alias: [
          { find: "~stitches", replacement: "../src/example/stitches.mjs" }
      ]
  }
})