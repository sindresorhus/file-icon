# file-icon

> Get the icon of a file or app as a PNG image

Requires macOS 10.10 or later. macOS 10.13 or earlier needs to download the [Swift runtime support libraries](https://support.apple.com/kb/DL1998).

## Install

```
$ npm install file-icon
```

## Usage

```js
import fs from 'fs';
import fileIcon from 'file-icon';

// An app name can be used
const buffer = await fileIcon.buffer('Safari');
fs.writeFileSync('safari-icon.png', buffer);

// An array of app names
const apps = ['Finder', 'Safari'];
const buffers = await fileIcon.buffer(apps);
buffers.map((buffer, index) => fs.writeFileSync(`${apps[index]}-icon.png`, buffer));

// Or a bundle ID
const buffer2 = await fileIcon.buffer('com.apple.Safari', {size: 64});
fs.writeFileSync('safari-icon.png', buffer2);

// Or a an array of bundle IDs
const bundleIds = ['com.apple.Finder', 'com.apple.Safari'];
const buffers2 = await fileIcon.buffer(bundleIds);
buffers2.map((buffer, index) => fs.writeFileSync(`${bundleIds[index]}-icon.png`, buffer));

// Or a process ID
const buffer3 = await fileIcon.buffer(257);
fs.writeFileSync('pid.png', buffer3);

// Or an array of process IDs
const pids = [257, 16];
const buffers3 = await fileIcon.buffer(pids, {size: 128});
buffers3.map((buffer, index) => fs.writeFileSync(`${pids[index]}-icon.png`, buffer));

// Or a path to an app / file
const buffer4 = await fileIcon.buffer('/Applications/Safari.app');
fs.writeFileSync('safari-icon.png', buffer4);

// Or an array of filenames
const paths = ['/Applications/Safari.app', '/Applications/Calculator.app'];
const buffers4 = await fileIcon.buffer(paths);
buffers4.map((buffer, index) => fs.writeFileSync(`${paths[index].split(/\/|\./)[2]}-icon.png`, buffer));
fs.writeFileSync('jpeg-file-type-icon.png', buffer4);

// Or a mix of all of them!
await fileIcon.buffer(['Finder', 257, 'com.apple.Calculator', '/Applications/Safari.app']);

// You can also use `fileIcon.file` and provide `options.destination` with the path to write to
await fileIcon.file('Safari', {destination: 'safari-icon.png'});

// You can also use same length arrays for `input` and `options.destination`
await fileIcon.file(['Safari', 'Finder'], {destination: ['safari-icon.png', 'finder-icon.png']});

console.log('Done');
```

## API

### fileIcon.buffer(input, options?)

Returns a `Promise<Buffer>` for a PNG image if `input` is of type `string` or `number`.

Returns a `Promise<Buffer[]>` for multiple PNG images if `input` is of type `Array<string | number>`.

### input

Type: `string | number | Array<string | number>`

Either:
- App name *(string)*
- App bundle identifier *(string)*
- App process ID *(number)*
- Path to an app *(string)*
- Path to a file *(string)*

### options

Type: `object`

#### size

Type: `number`\
Default: `1024`\
Maximum: `1024`

Size of the returned icon.

### fileIcon.file(input, options?)

Returns a `Promise` that resolves when the files are written to `options.destination`.

### input

Type: `string | number | Array<string | number>`

### options

Type: `object`

#### size

Type: `number`\
Default: `1024`\
Maximum: `1024`

Size of the returned icon.

#### destination

*Required*\
Type: `string | string[]`

Output file for the icon. If `input` is a single value, `options.destination` *must* be of type `string`.  If `input` is an `Array`, `options.destination` *must* be of type `string[]` with the same `length` as `input`.

## Related

- [file-icon-cli](https://github.com/sindresorhus/file-icon-cli) - CLI for this module
- [app-path](https://github.com/sindresorhus/app-path) - Get the path to an app
