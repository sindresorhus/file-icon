'use strict';
const path = require('path');
const execa = require('execa');

const bin = path.join(__dirname, 'file-icon');

const validate = (file, opts) => {
	opts = Object.assign({
		size: 1024
	}, opts);

	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	if (!file) {
		throw new Error('Specify an app name, bundle identifier, or file path');
	}

	if (typeof opts.size !== 'number') {
		opts.size = 1024;
	}

	if (opts.size > 1024) {
		throw new Error('Size must be 1024 or less');
	}

	return opts;
};

exports.buffer = (file, opts) => Promise.resolve().then(() => {
	opts = validate(file, opts);

	const isPid = typeof file === 'number';

	return execa.stdout(bin, [file, opts.size, isPid], {encoding: 'buffer'});
});

exports.file = (file, opts) => Promise.resolve().then(() => {
	opts = Object.assign({}, validate(file, opts));

	if (typeof opts.destination !== 'string') {
		throw new TypeError(`Expected \`destination\` to be of type \`string\`, got \`${typeof opts.destination}\``);
	}

	const isPid = typeof file === 'number';

	return execa(bin, [file, opts.size, isPid, opts.destination]);
});
