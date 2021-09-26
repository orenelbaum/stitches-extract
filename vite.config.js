import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
	resolve: {
		alias: [
			{ find: "~stitches", replacement: "../src/example/stitches.mjs" }
		]
	}
})