import fs from 'node:fs';
import test from 'ava';
import FileType from 'file-type';
import tempy from 'tempy';
import execa from 'execa';
import {fileIconToBuffer, fileIconToFile} from './index.js';

const processID = async app => {
	const {stdout} = await execa('pgrep', [app]);
	return Number.parseInt(stdout.split('\n')[0], 10);
};

const temporaryFile = () => tempy.file({extension: 'png'});

test('argument validation', async t => {
	const finderPID = await processID('Finder');

	await t.notThrowsAsync(fileIconToBuffer('Safari'));
	await t.notThrowsAsync(fileIconToBuffer(finderPID));
	await t.notThrowsAsync(fileIconToBuffer(['Safari', 'Finder']));
	await t.notThrowsAsync(fileIconToBuffer(['Safari', finderPID]));

	await t.throwsAsync(fileIconToBuffer({}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToBuffer([{}]), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToBuffer(['Safari', {}]), {instanceOf: TypeError});

	await t.notThrowsAsync(fileIconToFile('Safari', {destination: temporaryFile()}));
	await t.notThrowsAsync(fileIconToFile(finderPID, {destination: temporaryFile()}));
	await t.notThrowsAsync(fileIconToFile(['Safari', 'Finder'], {destination: [temporaryFile(), temporaryFile()]}));
	await t.notThrowsAsync(fileIconToFile(['Safari', finderPID], {destination: [temporaryFile(), temporaryFile()]}));

	await t.throwsAsync(fileIconToFile(['Safari']), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari'], {destination: temporaryFile()}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari', 'Finder'], {destination: [temporaryFile()]}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari', 'Finder'], {destination: [temporaryFile(), temporaryFile(), temporaryFile()]}), {instanceOf: TypeError});

	await t.throwsAsync(fileIconToFile({}, {destination: temporaryFile()}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile([{}], {destination: [temporaryFile()]}), {instanceOf: TypeError});
	await t.throwsAsync(fileIconToFile(['Safari', {}], {destination: [temporaryFile(), temporaryFile()]}), {instanceOf: TypeError});
});

test('app name', async t => {
	t.is((await FileType.fromBuffer(await fileIconToBuffer('Safari'))).ext, 'png');
});

test('array of single app name', async t => {
	const apps = ['Finder'];
	const buffers = await fileIconToBuffer(apps);

	t.is(buffers.length, 1);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
});

test('array of multiple app names', async t => {
	const apps = ['Finder', 'Safari'];
	const buffers = await fileIconToBuffer(apps);

	t.is(buffers.length, 2);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
	t.is((await FileType.fromBuffer(buffers[1])).ext, 'png');
});

test('app bundle ID', async t => {
	t.is((await FileType.fromBuffer(await fileIconToBuffer('com.apple.Safari'))).ext, 'png');
});

test('array of single app bundle ID', async t => {
	const apps = ['com.apple.Finder'];
	const buffers = await fileIconToBuffer(apps);

	t.is(buffers.length, 1);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
});

test('array of multiple app bundle IDs', async t => {
	const ids = ['com.apple.Finder', 'com.apple.Safari'];
	const buffers = await fileIconToBuffer(ids);

	t.is(buffers.length, 2);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
	t.is((await FileType.fromBuffer(buffers[1])).ext, 'png');
});

test('app process ID', async t => {
	const finderPID = await processID('Finder');

	t.is((await FileType.fromBuffer(await fileIconToBuffer(finderPID))).ext, 'png');
});

test('array of single app process ID', async t => {
	const finderPID = await processID('Finder');

	const pids = [finderPID];
	const buffers = await fileIconToBuffer(pids);

	t.is(buffers.length, 1);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
});

test('array of multiple app process IDs', async t => {
	const apps = ['Finder', 'loginwindow'];
	const pids = await Promise.all(apps.map(app => processID(app)));
	const buffers = await fileIconToBuffer(pids);

	t.is(buffers.length, 2);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
	t.is((await FileType.fromBuffer(buffers[1])).ext, 'png');
});

test('array of mixed types', async t => {
	const loginwindowPID = await processID('loginwindow');

	const apps = ['com.apple.Finder', loginwindowPID, 'Safari'];
	const buffers = await fileIconToBuffer(apps);

	t.is(buffers.length, 3);
	t.is((await FileType.fromBuffer(buffers[0])).ext, 'png');
	t.is((await FileType.fromBuffer(buffers[1])).ext, 'png');
	t.is((await FileType.fromBuffer(buffers[2])).ext, 'png');
});

test('file path', async t => {
	t.is((await FileType.fromBuffer(await fileIconToBuffer('/Applications/Safari.app'))).ext, 'png');
});

test('write file single app name', async t => {
	const destination = temporaryFile();
	await fileIconToFile('Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is((await FileType.fromBuffer(icon)).ext, 'png');
});

test('write file array of single app name', async t => {
	const destination = [temporaryFile()];

	await fileIconToFile(['Safari'], {destination});

	t.is(destination.length, 1);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
});

test('write files array of app names', async t => {
	const destination = [temporaryFile(), temporaryFile()];

	await fileIconToFile(['Safari', 'Finder'], {destination});

	t.is(destination.length, 2);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[1]))).ext, 'png');
});

test('write file single app bundle ID', async t => {
	const destination = temporaryFile();
	await fileIconToFile('com.apple.Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is((await FileType.fromBuffer(icon)).ext, 'png');
});

test('write file array of single app bundle ID', async t => {
	const destination = [temporaryFile()];

	await fileIconToFile(['com.apple.Safari'], {destination});

	t.is(destination.length, 1);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
});

test('write files array of app bundle IDs', async t => {
	const destination = [temporaryFile(), temporaryFile()];

	await fileIconToFile(['com.apple.Safari', 'com.apple.Finder'], {destination});

	t.is(destination.length, 2);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[1]))).ext, 'png');
});

test('write file single app process ID', async t => {
	const destination = temporaryFile();
	const pid = await processID('Finder');
	await fileIconToFile(pid, {destination});
	const icon = fs.readFileSync(destination);

	t.is((await FileType.fromBuffer(icon)).ext, 'png');
});

test('write file array of single app process ID', async t => {
	const apps = ['Finder'];
	const destination = [temporaryFile()];
	const pids = await Promise.all(apps.map(app => processID(app)));

	await fileIconToFile(pids, {destination});

	t.is(destination.length, 1);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
});

test('write files array of app process IDs', async t => {
	const apps = ['Finder', 'loginwindow'];
	const destination = [temporaryFile(), temporaryFile()];
	const pids = await Promise.all(apps.map(app => processID(app)));

	await fileIconToFile(pids, {destination});

	t.is(destination.length, 2);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[1]))).ext, 'png');
});

test('write files array of mixed types', async t => {
	const loginwindowPID = await processID('loginwindow');
	const apps = ['com.apple.Finder', loginwindowPID, 'Safari'];
	const destination = [temporaryFile(), temporaryFile(), temporaryFile()];
	await fileIconToFile(apps, {destination});

	t.is(destination.length, 3);
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[0]))).ext, 'png');
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[1]))).ext, 'png');
	t.is((await FileType.fromBuffer(fs.readFileSync(destination[2]))).ext, 'png');
});
