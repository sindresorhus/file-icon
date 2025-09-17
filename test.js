import fs from 'node:fs';
import test from 'ava';
import {fileTypeFromBuffer} from 'file-type';
import {temporaryFile} from 'tempy';
import {execa} from 'execa';
import {fileIconToBuffer, fileIconToFile} from './index.js';

const processID = async app => {
	const {stdout} = await execa('pgrep', [app]);
	return Number.parseInt(stdout.split('\n')[0], 10);
};

const isPNG = async buffer => {
	const fileType = await fileTypeFromBuffer(buffer);
	return fileType?.ext === 'png';
};

const isBuffer = value => value instanceof Uint8Array;

test('fileIconToBuffer - single inputs', async t => {
	const finderPID = await processID('Finder');

	// Test various input types
	const inputs = [
		'Safari', // App name
		'com.apple.Safari', // Bundle ID
		'/Applications/Safari.app', // Path
		finderPID, // Process ID
	];

	const buffers = await Promise.all(inputs.map(input => fileIconToBuffer(input)));
	for (const buffer of buffers) {
		t.true(isBuffer(buffer));
	}

	// Test PNG format for first buffer to avoid await in loop
	t.true(await isPNG(buffers[0]));

	// Test with options
	const buffer = await fileIconToBuffer('Safari', {size: 512});
	t.true(await isPNG(buffer));
});

test('fileIconToBuffer - array inputs', async t => {
	const finderPID = await processID('Finder');

	// Test mixed types array
	const mixedInput = ['Safari', finderPID, 'com.apple.Calculator'];
	const buffers = await fileIconToBuffer(mixedInput);

	t.is(buffers.length, mixedInput.length);

	for (const buffer of buffers) {
		t.true(isBuffer(buffer));
	}

	// Test PNG format for first buffer
	t.true(await isPNG(buffers[0]));

	// Test simple app names array
	const appBuffers = await fileIconToBuffer(['Safari', 'Finder']);
	t.is(appBuffers.length, 2);
	t.true(isBuffer(appBuffers[0]));
});

test('fileIconToFile - single inputs', async t => {
	const destination = temporaryFile({extension: 'png'});

	await fileIconToFile('Safari', {destination});

	t.true(fs.existsSync(destination));
	const icon = fs.readFileSync(destination);
	t.true(await isPNG(icon));
});

test('fileIconToFile - array inputs', async t => {
	const apps = ['Safari', 'Finder'];
	const destinations = apps.map(() => temporaryFile({extension: 'png'}));

	await fileIconToFile(apps, {destination: destinations});

	for (const destination of destinations) {
		t.true(fs.existsSync(destination));
	}

	// Test PNG format for first file only to avoid await in loop
	const icon = fs.readFileSync(destinations[0]);
	t.true(await isPNG(icon));
});

test('argument validation', async t => {
	const finderPID = await processID('Finder');

	// Valid calls should not throw
	await t.notThrowsAsync(fileIconToBuffer('Safari'));
	await t.notThrowsAsync(fileIconToBuffer(['Safari', finderPID]));
	await t.notThrowsAsync(fileIconToFile('Safari', {destination: temporaryFile({extension: 'png'})}));

	// Invalid calls should throw
	await t.throwsAsync(fileIconToBuffer({}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToBuffer([{}]), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile('Safari'), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(finderPID, {destination: ['array-for-single.png']}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari'], {destination: 'single.png'}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari', 'Finder'], {destination: ['only-one.png']}), {instanceOf: TypeError});
});
