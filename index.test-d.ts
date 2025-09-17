import {expectType, expectError} from 'tsd';
import {fileIconToBuffer, fileIconToFile} from './index.js';

// FileIconToBuffer - single inputs
expectType<Promise<Uint8Array>>(fileIconToBuffer('Safari'));
expectType<Promise<Uint8Array>>(fileIconToBuffer('com.apple.Safari'));
expectType<Promise<Uint8Array>>(fileIconToBuffer('/Applications/Safari.app'));
expectType<Promise<Uint8Array>>(fileIconToBuffer(1234));
expectType<Promise<Uint8Array>>(fileIconToBuffer('Safari', {size: 512}));

// FileIconToBuffer - array inputs
expectType<Promise<Uint8Array[]>>(fileIconToBuffer(['Safari', 'Finder']));
expectType<Promise<Uint8Array[]>>(fileIconToBuffer([1234, 5678]));
expectType<Promise<Uint8Array[]>>(fileIconToBuffer(['Safari', 'com.apple.Finder', '/Applications/Calculator.app', 257]));
expectType<Promise<Uint8Array[]>>(fileIconToBuffer(['Safari', 'Finder'], {size: 256}));

// FileIconToFile - single inputs
expectType<Promise<void>>(fileIconToFile('Safari', {destination: 'safari.png'}));
expectType<Promise<void>>(fileIconToFile('Safari', {destination: 'safari.png', size: 512}));

// FileIconToFile - array inputs
expectType<Promise<void>>(fileIconToFile(['Safari', 'Finder'], {destination: ['safari.png', 'finder.png']}));
expectType<Promise<void>>(fileIconToFile(['Safari', 'Finder'], {destination: ['safari.png', 'finder.png'], size: 256}));

// Error cases
expectError(fileIconToFile('Safari', {})); // Missing destination
expectError(fileIconToFile('Safari', {destination: 123})); // Wrong destination type
expectError(fileIconToFile(['Safari', 'Chrome'], {destination: 'single.png'})); // Array input with string destination
expectError(fileIconToFile('Safari', {destination: ['multiple.png']})); // Single input with array destination
