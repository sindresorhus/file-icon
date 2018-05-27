'use strict';
const path = require('path');
const execa = require('execa');

const bin = path.join(__dirname, 'file-icon');

const validate = (file, options) => {
	options = Object.assign({
		size: 1024
	}, options);

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

exports.buffer = async (file, options) => {
	options = validate(file, options);

	const isPid = typeof file === 'number';

	return execa.stdout(bin, [file, options.size, isPid], {encoding: 'buffer'});
};

exports.file = async (file, options) => {
	options = Object.assign({}, validate(file, options));

	if (typeof options.destination !== 'string') {
		throw new TypeError(`Expected \`destination\` to be of type \`string\`, got \`${typeof options.destination}\``);
	}

	const isPid = typeof file === 'number';

	return execa(bin, [file, options.size, isPid, options.destination]);
};
