declare namespace FileIcon {
	interface CommonOptions {
		size: number;
	}

	interface FileOptions extends CommonOptions {
		destination: string;
	}

	interface BufferOptions extends CommonOptions {}

	type InputType = string | number;

	function file(input: InputType, options?: FileOptions): Promise<void>;
	function buffer(input: InputType, options?: BufferOptions): Promise<Buffer>;
}

export default FileIcon;
