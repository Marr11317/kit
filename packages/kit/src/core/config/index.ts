import fs from 'fs';
import path from 'path';
import { logger } from '../utils.js';
import options from './options.js';
import { loadConfig } from 'unconfig';
import type { ValidatedConfig, Config } from 'types';

export function load_template(cwd: string, config: ValidatedConfig) {
	const { template } = config.kit.files;
	const relative = path.relative(cwd, template);

	if (fs.existsSync(template)) {
		const contents = fs.readFileSync(template, 'utf8');
		const expected_tags = ['%svelte.head%', '%svelte.body%'];
		expected_tags.forEach((tag) => {
			if (contents.indexOf(tag) === -1) {
				throw new Error(`${relative} is missing ${tag}`);
			}
		});
	} else {
		throw new Error(`${relative} does not exist`);
	}

	return fs.readFileSync(template, 'utf-8');
}

export async function load_config({ cwd = process.cwd() } = {}) {
	// load from `svelte.config.xx` where xx is one of ts, mjs, js, json
	const { config, sources } = await loadConfig<Config>({
		sources: [{ files: 'svelte.config' }]
	});

	if (!sources.length) {
		throw new Error(
			'You need to create a svelte.config.js file. See https://kit.svelte.dev/docs/configuration'
		);
	}

	const validated = validate_config(config);

	validated.kit.files.assets = path.resolve(cwd, validated.kit.files.assets);
	validated.kit.files.hooks = path.resolve(cwd, validated.kit.files.hooks);
	validated.kit.files.lib = path.resolve(cwd, validated.kit.files.lib);
	validated.kit.files.routes = path.resolve(cwd, validated.kit.files.routes);
	validated.kit.files.serviceWorker = path.resolve(cwd, validated.kit.files.serviceWorker);
	validated.kit.files.template = path.resolve(cwd, validated.kit.files.template);

	return validated;
}

export function validate_config(config: Config): ValidatedConfig {
	if (typeof config !== 'object') {
		throw new Error(
			'svelte.config.js must have a configuration object as its default export. See https://kit.svelte.dev/docs/configuration'
		);
	}

	return options(config, 'config');
}

export function print_config_conflicts(conflicts: string[], pathPrefix = '', scope?: string) {
	const prefix = scope ? scope + ': ' : '';
	const log = logger({ verbose: false });
	conflicts.forEach((conflict) => {
		log.error(
			`${prefix}The value for ${pathPrefix}${conflict} specified in svelte.config.js has been ignored. This option is controlled by SvelteKit.`
		);
	});
}
