'use strict';
const path = require('path');
const util = require('util');
const {execFile} = require('child_process');

const execFileP = util.promisify(execFile);
const bin = path.join(__dirname, 'file-icon');
const HUNDRED_MEGABYTES = 1024 * 1024 * 100;
const EOF_HEX = '3c454f463e'; // '<EOF>'

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
		throw new Error('Specify one or an array of: app name, bundle identifier, file path, or pid');
	}

	if (typeof file !== 'string' && typeof file !== 'number' && !Array.isArray(file)) {
		throw new TypeError(`Expected \`file\` be a string, number, or an array, got \`${typeof file}\``);
	}

	if (Array.isArray(file) && !file.every(f => typeof f === 'string' || typeof f === 'number')) {
		throw new TypeError('Expected all members of `file` array to be of `string` or `number` type');
	}

	if (typeof options.size !== 'number') {
		options.size = 1024;
	}

	if (options.size > 1024) {
		throw new Error('Size must be 1024 or less');
	}

	return options;
};

const toArray = input => Array.isArray(input) ? input : [input];

exports.buffer = async (file, options) => {
	options = validate(file, options);

	const files = toArray(file);
	const isPid = files.map(file => (typeof file === 'number').toString());

	const {stdout} = await execFileP(bin, [files, options.size, isPid], spawnOptions);

	const buffers = stdout
		.toString('hex')
		.split(EOF_HEX)
		.filter(s => Boolean(s))
		.map(hex => Buffer.from(hex, 'hex'));

	return buffers.length === 1 && !Array.isArray(file) ?
		buffers[0] :
		buffers;
};

exports.file = async (file, options) => {
	options = validate(file, options);

	const isArray = Array.isArray(file);

	if (typeof file === 'string' && typeof options.destination !== 'string') {
		throw new TypeError(`Expected \`options.destination\` to be of type \`string\` when \`file\` is of type \`string\`, got \`${typeof options.destination}\``);
	} else if (isArray && !Array.isArray(options.destination)) {
		throw new TypeError(`Expected \`options.destination\` to be of type \`array\` when \`file\` is of type \`array\`, got \`${typeof options.destination}\``);
	} else if (isArray && file.length !== options.destination.length) {
		throw new TypeError('Expected `file` and `options.destination` arrays to be of the same length');
	}

	const files = toArray(file);
	const isPid = files.map(file => (typeof file === 'number').toString());
	const destination = isArray ?
		options.destination.join(',') :
		options.destination;

	await execFileP(bin, [files, options.size, isPid, destination], spawnOptions);
};
