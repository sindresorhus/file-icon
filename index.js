'use strict';
const path = require('path');
const util = require('util');
const {execFile} = require('child_process');

const execFileP = util.promisify(execFile);
const bin = path.join(__dirname, 'file-icon');
const HUNDRED_MEGABYTES = 1024 * 1024 * 100;

const spawnOptions = {
	encoding: null,
	maxBuffer: HUNDRED_MEGABYTES
};

const validate = (file, options) => {
	options = {
		size: 1024,
		...options
	};

	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	if (!file) {
		throw new Error('Specify an app name, bundle identifier, or file path');
	}

	if (typeof options.size !== 'number') {
		options.size = 1024;
	}

	if (options.size > 1024) {
		throw new Error('Size must be 1024 or less');
	}

	return options;
};

const processBuffer = async (file, options) => {
	options = validate(file, options);

	const isPid = typeof file === 'number';

	const {stdout} = await execFileP(bin, [file, options.size, isPid], spawnOptions);

	return stdout;
};

exports.buffer = async (file, options) => {
	if (Array.isArray(file)) {
		return Promise.all(file.map(f => processBuffer(f, options)));
	}
	return processBuffer(file, options);
};

exports.file = async (file, options) => {
	options = validate(file, options);

	if (typeof options.destination !== 'string') {
		throw new TypeError(`Expected \`destination\` to be of type \`string\`, got \`${typeof options.destination}\``);
	}

	const isPid = typeof file === 'number';

	await execFileP(bin, [file, options.size, isPid, options.destination], spawnOptions);
};
