'use strict';
const path = require('path');
const execa = require('execa');

const bin = path.join(__dirname, '.build/release/file-icon');

module.exports = (file, opts) => {
	opts = Object.assign({
		size: 1024
	}, opts);

	if (process.platform !== 'darwin') {
		return Promise.reject(new Error('macOS only'));
	}

	if (!file) {
		return Promise.reject(new Error('Specify an app name, bundle identifier, or file path'));
	}

	if (typeof opts.size !== 'number') {
		opts.size = 1024;
	}

	if (opts.size > 1024) {
		return Promise.reject(new Error('Size must be 1024 or less'));
	}

	if (opts.destination && typeof opts.destination !== 'string') {
		return Promise.reject(new Error(`Expected \`destination\` to be of type \`string\`, got \`${typeof opts.destination}\``));
	}

	const args = [file, opts.size];

	if (opts.destination) {
		args.push(opts.destination);
	}

	return execa.stdout(bin, args, {encoding: 'buffer'});
};
