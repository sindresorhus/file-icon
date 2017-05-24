'use strict';
const path = require('path');
const execa = require('execa');
const filenamify = require('filenamify');

const bin = path.join(__dirname, '.build/release/file-icon');

exports.buffer = (file, opts) => {
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

	return execa.stdout(bin, [file, opts.size], {encoding: 'buffer'});
};

exports.file = (file, opts) => {
	opts = Object.assign({
		size: 1024,
		destination: filenamify(file) + '.png'
	}, opts);

	if (process.platform !== 'darwin') {
		return Promise.reject(new Error('macOS only'));
	}

	if (!file) {
		return Promise.reject(new Error('Specify an app name, bundle identifier, or file path'));
	}

	if (typeof opts.destination !== 'string') {
		return Promise.reject(new TypeError(`Expected \`destination\` to be of type \`string\`, got \`${typeof opts.destination}\``));
	}

	if (typeof opts.size !== 'number') {
		opts.size = 1024;
	}

	if (opts.size > 1024) {
		return Promise.reject(new Error('Size must be 1024 or less'));
	}

	return execa(bin, [file, opts.size, opts.destination]);
};
