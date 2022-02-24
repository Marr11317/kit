import * as path from 'path';
import adapter from '@sveltejs/adapter-auto';
import { imagetools } from 'vite-imagetools';

import type { Config } from '@sveltejs/kit';

const config: Config = {
	kit: {
		adapter: adapter(),

		prerender: {
			entries: ['*', '/content.json']
		},

		vite: {
			plugins: [imagetools()],

			resolve: {
				alias: {
					$img: path.resolve('src/images')
				}
			},

			server: {
				fs: {
					strict: false
				}
			}
		}
	}
};

export default config;