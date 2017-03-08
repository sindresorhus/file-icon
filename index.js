'use strict';
const execa = require('execa');

module.exports = (file, size) => {
	if (process.platform !== 'darwin') {
		return Promise.reject(new Error('macOS only'));
	}

	if (!file) {
		return Promise.reject(new Error('Specify an app name, bundle identifier, or file path'));
	}

	if (typeof size !== 'number') {
		size = 1024;
	}

	if (size > 1024) {
		return Promise.reject(new Error('Size must be 1024 or less'));
	}

	return execa.stdout('./main', [file, size], {
		cwd: __dirname,
		encoding: 'buffer'
	});
};
