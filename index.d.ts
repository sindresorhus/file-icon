/**
Options for the file icon functions.
*/
export type Options = {
	/**
	Size of the returned icon.

	@default 1024
	Maximum: 1024
	*/
	readonly size?: number;
};

/**
Get the icon of a file or app as a PNG buffer.

Returns a `Promise<Uint8Array>` for a PNG image if `input` is of type `string` or `number`.

Returns a `Promise<Uint8Array[]>` for multiple PNG images if `input` is of type `Array<string | number>`.

@param input - App name, bundle identifier, file path, or process ID. Can also be an array of any of these.
@param options - Options for the icon.

@example
```
import fs from 'node:fs';
import {fileIconToBuffer} from 'file-icon';

// An app name can be used
const buffer = await fileIconToBuffer('Safari');
fs.writeFileSync('safari-icon.png', buffer);

// An array of app names
const apps = ['Finder', 'Safari'];
const buffers = await fileIconToBuffer(apps);
buffers.map((buffer, index) => fs.writeFileSync(`${apps[index]}-icon.png`, buffer));

// Or a bundle ID
const buffer2 = await fileIconToBuffer('com.apple.Safari', {size: 64});
fs.writeFileSync('safari-icon.png', buffer2);

// Or an array of bundle IDs
const bundleIds = ['com.apple.Finder', 'com.apple.Safari'];
const buffers2 = await fileIconToBuffer(bundleIds);
buffers2.map((buffer, index) => fs.writeFileSync(`${bundleIds[index]}-icon.png`, buffer));

// Or a process ID
const buffer3 = await fileIconToBuffer(257);
fs.writeFileSync('pid.png', buffer3);

// Or an array of process IDs
const pids = [257, 16];
const buffers3 = await fileIconToBuffer(pids, {size: 128});
buffers3.map((buffer, index) => fs.writeFileSync(`${pids[index]}-icon.png`, buffer));

// Or a path to an app / file
const buffer4 = await fileIconToBuffer('/Applications/Safari.app');
fs.writeFileSync('safari-icon.png', buffer4);

// Or an array of file paths
const paths = ['/Applications/Safari.app', '/Applications/Calculator.app'];
const buffers4 = await fileIconToBuffer(paths);
buffers4.map((buffer, index) => fs.writeFileSync(`app-${index}-icon.png`, buffer));

// Or a mix of all of them!
const mixedBuffers = await fileIconToBuffer(['Finder', 257, 'com.apple.Calculator', '/Applications/Safari.app']);
```
*/
export function fileIconToBuffer(input: string | number, options?: Options): Promise<Uint8Array>;
export function fileIconToBuffer(input: Array<string | number>, options?: Options): Promise<Uint8Array[]>;

/**
Save the icon of a file or app as a PNG file.

Returns a `Promise` that resolves when the files are written to `options.destination`.

@param input - App name, bundle identifier, file path, or process ID. Can also be an array of any of these.
@param options - Options for the icon including the destination path(s).

@example
```
import {fileIconToFile} from 'file-icon';

// You can use `fileIconToFile` and provide `options.destination` with the path to write to
await fileIconToFile('Safari', {destination: 'safari-icon.png'});

// You can also use same length arrays for `input` and `options.destination`
await fileIconToFile(['Safari', 'Finder'], {destination: ['safari-icon.png', 'finder-icon.png']});

// Custom size
await fileIconToFile('Safari', {destination: 'safari-icon.png', size: 512});
```
*/
export function fileIconToFile(
	input: string | number,
	options: Options & {readonly destination: string}
): Promise<void>;
export function fileIconToFile(
	input: Array<string | number>,
	options: Options & {readonly destination: readonly string[]}
): Promise<void>;
