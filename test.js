import fs from 'fs';
import test from 'ava';
import fileType from 'file-type';
import tempy from 'tempy';
import execa from 'execa';
import fileIcon from '.';

const processId = async app => {
	const {stdout} = await execa('pgrep', [app]);
	return parseInt(stdout.split('\n')[0], 10);
};

const tmpFile = () => tempy.file({extension: 'png'});

test('argument validation', async t => {
	const finderPid = await processId('Finder');

	await t.notThrowsAsync(() => fileIcon.buffer('Safari'));
	await t.notThrowsAsync(() => fileIcon.buffer(finderPid));
	await t.notThrowsAsync(() => fileIcon.buffer(['Safari', 'Finder']));
	await t.notThrowsAsync(() => fileIcon.buffer(['Safari', finderPid]));

	await t.throwsAsync(() => fileIcon.buffer({}), TypeError);
	await t.throwsAsync(() => fileIcon.buffer([{}]), TypeError);
	await t.throwsAsync(() => fileIcon.buffer(['Safari', {}]), TypeError);

	await t.notThrowsAsync(() => fileIcon.file('Safari', {destination: tmpFile()}));
	await t.notThrowsAsync(() => fileIcon.file(finderPid, {destination: tmpFile()}));
	await t.notThrowsAsync(() => fileIcon.file(['Safari', 'Finder'], {destination: [tmpFile(), tmpFile()]}));
	await t.notThrowsAsync(() => fileIcon.file(['Safari', finderPid], {destination: [tmpFile(), tmpFile()]}));

	await t.throwsAsync(() => fileIcon.file(['Safari']), TypeError);
	await t.throwsAsync(() => fileIcon.file(['Safari'], {destination: tmpFile()}), TypeError);
	await t.throwsAsync(() => fileIcon.file(['Safari', 'Finder'], {destination: [tmpFile()]}), TypeError);
	await t.throwsAsync(() => fileIcon.file(['Safari', 'Finder'], {destination: [tmpFile(), tmpFile(), tmpFile()]}), TypeError);

	await t.throwsAsync(() => fileIcon.file({}, {destination: tmpFile()}), TypeError);
	await t.throwsAsync(() => fileIcon.file([{}], {destination: [tmpFile()]}), TypeError);
	await t.throwsAsync(() => fileIcon.file(['Safari', {}], {destination: [tmpFile(), tmpFile()]}), TypeError);
});

test('app name', async t => {
	t.is(fileType(await fileIcon.buffer('Safari')).ext, 'png');
});

test('array of single app name', async t => {
	const apps = ['Finder'];
	const buffers = await fileIcon.buffer(apps);

	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app names', async t => {
	const apps = ['Finder', 'Safari'];
	const buffers = await fileIcon.buffer(apps);

	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('app bundle id', async t => {
	t.is(fileType(await fileIcon.buffer('com.apple.Safari')).ext, 'png');
});

test('array of single app bundle id', async t => {
	const apps = ['com.apple.Finder'];
	const buffers = await fileIcon.buffer(apps);

	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app bundle ids', async t => {
	const ids = ['com.apple.Finder', 'com.apple.Safari'];
	const buffers = await fileIcon.buffer(ids);

	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('app process id', async t => {
	const finderPid = await processId('Finder');

	t.is(fileType(await fileIcon.buffer(finderPid)).ext, 'png');
});

test('array of single app process id', async t => {
	const finderPid = await processId('Finder');

	const pids = [finderPid];
	const buffers = await fileIcon.buffer(pids);

	t.is(fileType(buffers[0]).ext, 'png');
});

test('array of multiple app process ids', async t => {
	const apps = ['Finder', 'loginwindow'];
	const pids = await Promise.all(apps.map(processId));
	const buffers = await fileIcon.buffer(pids);

	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
});

test('array of mixed types', async t => {
	const loginwindowPid = await processId('loginwindow');

	const apps = ['com.apple.Finder', loginwindowPid, 'Safari'];
	const buffers = await fileIcon.buffer(apps);

	t.is(fileType(buffers[0]).ext, 'png');
	t.is(fileType(buffers[1]).ext, 'png');
	t.is(fileType(buffers[2]).ext, 'png');
});

test('file path', async t => {
	t.is(fileType(await fileIcon.buffer('/Applications/Safari.app')).ext, 'png');
});

test('write file single app name', async t => {
	const destination = tmpFile();
	await fileIcon.file('Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app name', async t => {
	const destination = [tmpFile()];

	await fileIcon.file(['Safari'], {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app names', async t => {
	const destination = [tmpFile(), tmpFile()];

	await fileIcon.file(['Safari', 'Finder'], {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write file single app bundle id', async t => {
	const destination = tmpFile();
	await fileIcon.file('com.apple.Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app bundle id', async t => {
	const destination = [tmpFile()];

	await fileIcon.file(['com.apple.Safari'], {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app bundle ids', async t => {
	const destination = [tmpFile(), tmpFile()];

	await fileIcon.file(['com.apple.Safari', 'com.apple.Finder'], {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write file single app process id', async t => {
	const destination = tmpFile();
	const pid = await processId('Finder');
	await fileIcon.file(pid, {destination});
	const icon = fs.readFileSync(destination);

	t.is(fileType(icon).ext, 'png');
});

test('write file array of single app process id', async t => {
	const apps = ['Finder'];
	const destination = [tmpFile()];
	const pids = await Promise.all(apps.map(processId));

	await fileIcon.file(pids, {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
});

test('write files array of app process ids', async t => {
	const apps = ['Finder', 'loginwindow'];
	const destination = [tmpFile(), tmpFile()];
	const pids = await Promise.all(apps.map(processId));

	await fileIcon.file(pids, {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
});

test('write files array of mixed types', async t => {
	const loginwindowPid = await processId('loginwindow');
	const apps = ['com.apple.Finder', loginwindowPid, 'Safari'];
	const destination = [tmpFile(), tmpFile(), tmpFile()];
	await fileIcon.file(apps, {destination});

	t.is(fileType(fs.readFileSync(destination[0])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[1])).ext, 'png');
	t.is(fileType(fs.readFileSync(destination[2])).ext, 'png');
});
