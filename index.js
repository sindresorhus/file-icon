'use strict';
const path = require('path');
const util = require('util');
const {execFile} = require('child_process');

const execFileP = util.promisify(execFile);
const bin = path.join(__dirname, 'file-icon');
const HUNDRED_MEGABYTES = 1024 * 1024 * 100;
const EOF = '<EOF>';

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

const toCLIArgument = (file, {size, destination}) => {
	const toBuffer = file => ({appOrPID: file.toString(), size});
	const toFile = (file, index) => ({...toBuffer(file), destination: toArray(destination)[index]});

	const argument_ = toArray(file).map(destination ? toFile : toBuffer);

	return JSON.stringify(argument_);
};

const splitBuffer = (buffer, delimiter) => {
	const buffers = [];
	const offset = Buffer.from(delimiter).length;
	let copy = Buffer.from(buffer);
	let search = copy.indexOf(delimiter);

	while ((search = copy.indexOf(delimiter)) > -1) {
		buffers.push(copy.subarray(0, search + offset));
		copy = copy.subarray(search + offset, copy.length);
	}

	return buffers.length === 0 ? [buffer] : buffers;
};

exports.buffer = async (file, options) => {
	options = validate(file, options);

	const {stdout} = await execFileP(bin, [toCLIArgument(file, options)], spawnOptions);

	const buffers = splitBuffer(stdout, EOF);

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

	await execFileP(bin, [toCLIArgument(file, options)], spawnOptions);
};
