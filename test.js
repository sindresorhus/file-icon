import fs from 'fs';
import test from 'ava';
import fileType from 'file-type';
import tempy from 'tempy';
import execa from 'execa';
import fileIcon from '.';

const processID = async app => {
	const {stdout} = await execa('pgrep', [app]);
	return parseInt(stdout.split('\n')[0], 10);
};

const tempFile = () => tempy.file({extension: 'png'});

test('argument validation', async t => {
	const finderPID = await processID('Finder');

	await t.notThrowsAsync(fileIcon.buffer('Safari'));
	await t.notThrowsAsync(fileIcon.buffer(finderPID));
	await t.notThrowsAsync(fileIcon.buffer(['Safari', 'Finder']));
	await t.notThrowsAsync(fileIcon.buffer(['Safari', finderPID]));

	await t.throwsAsync(fileIcon.buffer({}), TypeError);
	await t.throwsAsync(fileIcon.buffer([{}]), TypeError);
	await t.throwsAsync(fileIcon.buffer(['Safari', {}]), TypeError);

	await t.notThrowsAsync(fileIcon.file('Safari', {destination: tempFile()}));
	await t.notThrowsAsync(fileIcon.file(finderPID, {destination: tempFile()}));
	await t.notThrowsAsync(fileIcon.file(['Safari', 'Finder'], {destination: [tempFile(), tempFile()]}));
	await t.notThrowsAsync(fileIcon.file(['Safari', finderPID], {destination: [tempFile(), tempFile()]}));

	await t.throwsAsync(fileIcon.file(['Safari']), TypeError);
	await t.throwsAsync(fileIcon.file(['Safari'], {destination: tempFile()}), TypeError);
	await t.throwsAsync(fileIcon.file(['Safari', 'Finder'], {destination: [tempFile()]}), TypeError);
	await t.throwsAsync(fileIcon.file(['Safari', 'Finder'], {destination: [tempFile(), tempFile(), tempFile()]}), TypeError);

	await t.throwsAsync(fileIcon.file({}, {destination: tempFile()}), TypeError);
	await t.throwsAsync(fileIcon.file([{}], {destination: [tempFile()]}), TypeError);
	await t.throwsAsync(fileIcon.file(['Safari', {}], {destination: [tempFile(), tempFile()]}), TypeError);
});

test('app name', async t => {
	t.is(fileType(await fileIcon.buffer('Safari')).ext, 'png');
});

test('array of single app name', async t => {
	const apps = ['Finder'];
	const buffers = await fileIcon.buffer(apps);

	t.is(buffers.length, 1);
	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app names', async t => {
	const apps = ['Finder', 'Safari'];
	const buffers = await fileIcon.buffer(apps);

	t.is(buffers.length, 2);
	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('app bundle ID', async t => {
	t.is(fileType(await fileIcon.buffer('com.apple.Safari')).ext, 'png');
});

test('array of single app bundle ID', async t => {
	const apps = ['com.apple.Finder'];
	const buffers = await fileIcon.buffer(apps);

	t.is(buffers.length, 1);
	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app bundle IDs', async t => {
	const ids = ['com.apple.Finder', 'com.apple.Safari'];
	const buffers = await fileIcon.buffer(ids);

	t.is(buffers.length, 2);
	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('app process ID', async t => {
	const finderPID = await processID('Finder');

	t.is(fileType(await fileIcon.buffer(finderPID)).ext, 'png');
});

test('array of single app process ID', async t => {
	const finderPID = await processID('Finder');

	const pids = [finderPID];
	const buffers = await fileIcon.buffer(pids);

	t.is(buffers.length, 1);
	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app process IDs', async t => {
	const apps = ['Finder', 'loginwindow'];
	const pids = await Promise.all(apps.map(processID));
	const buffers = await fileIcon.buffer(pids);

	t.is(buffers.length, 2);
	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('array of mixed types', async t => {
	const loginwindowPID = await processID('loginwindow');

	const apps = ['com.apple.Finder', loginwindowPID, 'Safari'];
	const buffers = await fileIcon.buffer(apps);

	t.is(buffers.length, 3);
	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
	t.is(fileType(buffers[2]).ext, 'png');
});

test('file path', async t => {
	t.is(fileType(await fileIcon.buffer('/Applications/Safari.app')).ext, 'png');
});

test('write file single app name', async t => {
	const destination = tempFile();
	await fileIcon.file('Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app name', async t => {
	const destination = [tempFile()];

	await fileIcon.file(['Safari'], {destination});

	t.is(destination.length, 1);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app names', async t => {
	const destination = [tempFile(), tempFile()];

	await fileIcon.file(['Safari', 'Finder'], {destination});

	t.is(destination.length, 2);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write file single app bundle ID', async t => {
	const destination = tempFile();
	await fileIcon.file('com.apple.Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app bundle ID', async t => {
	const destination = [tempFile()];

	await fileIcon.file(['com.apple.Safari'], {destination});

	t.is(destination.length, 1);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app bundle IDs', async t => {
	const destination = [tempFile(), tempFile()];

	await fileIcon.file(['com.apple.Safari', 'com.apple.Finder'], {destination});

	t.is(destination.length, 2);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write file single app process ID', async t => {
	const destination = tempFile();
	const pid = await processID('Finder');
	await fileIcon.file(pid, {destination});
	const icon = fs.readFileSync(destination);

	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app process ID', async t => {
	const apps = ['Finder'];
	const destination = [tempFile()];
	const pids = await Promise.all(apps.map(processID));

	await fileIcon.file(pids, {destination});

	t.is(destination.length, 1);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app process IDs', async t => {
	const apps = ['Finder', 'loginwindow'];
	const destination = [tempFile(), tempFile()];
	const pids = await Promise.all(apps.map(processID));

	await fileIcon.file(pids, {destination});

	t.is(destination.length, 2);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write files array of mixed types', async t => {
	const loginwindowPID = await processID('loginwindow');
	const apps = ['com.apple.Finder', loginwindowPID, 'Safari'];
	const destination = [tempFile(), tempFile(), tempFile()];
	await fileIcon.file(apps, {destination});

	t.is(destination.length, 3);
	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[2])).ext, 'png');
});
