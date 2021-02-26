/// <reference types="node"/>

type BufferOptions = {
	/**
	Size of the returned icon.

	@default 1024
	*/
	readonly size?: number;
};
type FileOptions<Multi extends boolean> = BufferOptions & {
	/**
	Output file for the icon.
	*/
	readonly destination: Multi extends true ? string[] : string;
};

type Identifier = string | number;

/**
Load the icon of file/app as PNG image into buffer.

@param identifier - An identifier can be either of: app name, app bundle identifier, process id, path to an app, path to a file.
@param options - Options for loading icon.
@returns Buffer contains png format icon.
*/
export declare function buffer(identifier: Identifier, options?: BufferOptions): Promise<Buffer>;
/**
Load the icon set of files/apps as PNG image into buffer.

@param identifiers - An identifier can be either of: app name, app bundle identifier, process id, path to an app, path to a file.
@param options - Options for loading icon.
@returns List of buffer contains png format icon.
*/
export declare function buffer(identifiers: readonly Identifier[], options?: BufferOptions): Promise<Buffer[]>;
/**
Save the icon set of files/apps as PNG image to destination.

@param identifier - An identifier can be either of: app name, app bundle identifier, process id, path to an app, path to a file.
@param options - Options for saving icon.
*/
export declare function file(identifier: Identifier, options: FileOptions<false>): Promise<void>;
/**
Save the icon set of files/apps as PNG image to destinations.

@param identifiers - An identifier can be either of: app name, app bundle identifier, process id, path to an app, path to a file.
@param options - Options for saving icon.
*/
export declare function file(identifiers: readonly Identifier[], options: FileOptions<true>): Promise<void>;
