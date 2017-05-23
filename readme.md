# file-icon [![Build Status](https://travis-ci.org/sindresorhus/file-icon.svg?branch=master)](https://travis-ci.org/sindresorhus/file-icon)

> Get the icon of a file or app as a PNG image *(macOS)*


## Install

```
$ npm install --save file-icon
```


## Usage

```js
const fs = require('fs');
const fileIcon = require('file-icon');

fileIcon('Safari').then(buffer => {
	fs.writeFileSync('safari-icon.png', buffer);
});

fileIcon('com.apple.Safari').then(buffer => {});

fileIcon('unicorn.jpg').then(buffer => {});

fileIcon('Safari', {destination: 'safari-icon.png'}).then(() => {
	const buffer = fs.readFileSync('safari-icon.png');
});
```


## API

### fileIcon(input, [options])

Returns a `Promise<Buffer>` for a PNG image.

### input

Type: `string`

Either:
- App name
- App bundle identifier
- Path to an app
- Path to a file

### options

Type: `object`

#### size

Type: `number`<br>
Default: `1024`<br>
Maximum: `1024`

Size of the returned icon.

#### destination

Type: `string`

Output file for the icon


## Related

- [file-icon-cli](https://github.com/sindresorhus/file-icon-cli) - CLI for this module
- [app-path](https://github.com/sindresorhus/app-path) - Get the path to an app


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
