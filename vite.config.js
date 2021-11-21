import { defineConfig } from 'vite'
import babel from 'rollup-plugin-babel';


export default defineConfig(({ mode }) => ({
	plugins: [
		babel({
			plugins: ["./src/lib/add-static-imports.babel-plugin.js"]
		})
	],
	resolve: {
		alias: [
			{ find: "~stitches", replacement: "../src/example/stitches.mjs" }
		]
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		}
	}
}))
