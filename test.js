import test from 'ava';
import fileType from 'file-type';
import m from '.';

test('app name', async t => {
	t.is(fileType(await m('Safari')).ext, 'png');
});

test('app bundle id', async t => {
	t.is(fileType(await m('com.apple.Safari')).ext, 'png');
});

test('file path', async t => {
	t.is(fileType(await m('/Applications/Safari.app')).ext, 'png');
});
