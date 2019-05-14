import fs from 'fs';
import test from 'ava';
import fileType from 'file-type';
import tempy from 'tempy';
import execa from 'execa';
import fileIcon from '.';

test('app name', async t => {
	t.is(fileType(await fileIcon.buffer('Safari')).ext, 'png');
});

test('app bundle id', async t => {
	t.is(fileType(await fileIcon.buffer('com.apple.Safari')).ext, 'png');
});

test('app process id', async t => {
	const {stdout} = await execa('pgrep', ['Finder']);
	const finderPid = parseInt(stdout.split('\n')[0], 10);
	t.is(fileType(await fileIcon.buffer(finderPid)).ext, 'png');
});

test('file path', async t => {
	t.is(fileType(await fileIcon.buffer('/Applications/Safari.app')).ext, 'png');
});

test('file array path', async t => {
	const files = await fileIcon.buffer(['/Applications/Safari.app', '/Applications/Photos.app']);
	t.is(files.length, 2);
	t.is(fileType(files[0]).ext, 'png');
	t.is(fileType(files[1]).ext, 'png');
});

test('write file', async t => {
	const destination = tempy.file({extension: 'png'});
	await fileIcon.file('Safari', {destination});
	const icon = fs.readFileSync(destination);
	t.is(fileType(icon).ext, 'png');
});
