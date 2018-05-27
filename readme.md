# file-icon [![Build Status](https://travis-ci.org/sindresorhus/file-icon.svg?branch=master)](https://travis-ci.org/sindresorhus/file-icon)

> Get the icon of a file or app as a PNG image *(macOS)*


## Install

```
$ npm install file-icon
```


## Usage

```js
const fs = require('fs');
const fileIcon = require('file-icon');

(async () => {
	const buffer = await fileIcon.buffer('Safari')
	fs.writeFileSync('safari-icon.png', buffer);

	// Or by bundle ID
	const buffer2 = await fileIcon.buffer('com.apple.Safari', {size: 64});
	fs.writeFileSync('safari-icon.png', buffer2);

	// Or by filename
	const buffer3 = await fileIcon.buffer('unicorn.jpg');
	fs.writeFileSync('jpeg-file-type-icon.png', buffer3);

	await fileIcon.file('Safari', {destination: 'safari-icon.png'});
	console.log('Done');
})();
```


## API

### fileIcon.buffer(input, [options])

Returns a `Promise<Buffer>` for a PNG image.

### input

Type: `string` `number`

Either:
- App name *(string)*
- App bundle identifier *(string)*
- App process ID *(number)*
- Path to an app *(string)*
- Path to a file *(string)*

### options

Type: `Object`

#### size

Type: `number`<br>
Default: `1024`<br>
Maximum: `1024`

Size of the returned icon.

### fileIcon.file(input, [options])

Returns a `Promise` for when the file is written to `destination`.

### options

Type: `Object`

#### size

Type: `number`<br>
Default: `1024`<br>
Maximum: `1024`

Size of the returned icon.

#### destination

*Required*<br>
Type: `string`

Output file for the icon.


## Related

- [file-icon-cli](https://github.com/sindresorhus/file-icon-cli) - CLI for this module
- [app-path](https://github.com/sindresorhus/app-path) - Get the path to an app


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
