import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	base: './',
	server: {
		port: 8081,
		host: '0.0.0.0',
		open: true
	},
	build: {
		assetsDir: 'assets',
		sourcemap: false,
		target: 'esnext',
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				inlineDynamicImports: true, // Объединяет динамические импорты в один файл
				entryFileNames: 'index.js', // Имя выходного файла
			}
		},
		assetsInlineLimit: 0,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				passes: 2,
				dead_code: true,
				pure_funcs: ['console.log', 'console.info', 'console.debug'],
				unsafe: true,
				unsafe_comps: true,
			},
			mangle: {
				toplevel: true,
				eval: true,
				reserved: ['__PIXI_APP__'],
			},
			format: {
				comments: false,
			},
		},
		chunkSizeWarningLimit: 2000,
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify('production')
	},
	alias: {
		crypto: false,
		stream: false,
		buffer: false,
	},
	esbuild: {
		target: 'esnext'
	},
	plugins: [
		viteSingleFile(),
		visualizer({
			open: true,
			gzipSize: true,
			brotliSize: true,
			template: 'treemap',
			filename: 'stats.html'
		})
	],
});
