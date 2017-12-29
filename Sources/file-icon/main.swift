import Cocoa

extension NSBitmapImageRep {
	var png: Data? {
		return representation(using: .png, properties: [:])
	}
}

extension Data {
	var bitmap: NSBitmapImageRep? {
		return NSBitmapImageRep(data: self)
	}
}

extension NSImage {
	var png: Data? {
		return tiffRepresentation?.bitmap?.png
	}

	func resizedForFile(to size: Int) -> NSImage {
		let newSizeInt = size / Int(NSScreen.main?.backingScaleFactor ?? 1)
		let newSize = CGSize(width: newSizeInt, height: newSizeInt)

		let image = NSImage(size: newSize)
		image.lockFocus()
		NSGraphicsContext.current?.imageInterpolation = .high

		draw(
			in: CGRect(origin: .zero, size: newSize),
			from: .zero,
			operation: .copy,
			fraction: 1
		)

		image.unlockFocus()
		return image
	}
}

struct CLI {
	final class StandardErrorTextStream: TextOutputStream {
		func write(_ string: String) {
			FileHandle.standardError.write(string.data(using: .utf8)!)
		}
	}

	static let stdout = FileHandle.standardOutput
	static let stderr = FileHandle.standardError

	private static var _stderr = StandardErrorTextStream()
	static func printErr<T>(_ item: T) {
		Swift.print(item, to: &_stderr)
	}

	static let arguments = Array(CommandLine.arguments.dropFirst(1))
}

func getIcon(input: String, size: Int) -> Data? {
	let ws = NSWorkspace.shared

	let path = (
		input.contains(".") ?
			ws.absolutePathForApplication(withBundleIdentifier: input) :
			ws.fullPath(forApplication: input)
	) ?? input

	if !FileManager.default.fileExists(atPath: path) {
		return nil
	}

	return ws.icon(forFile: path).resizedForFile(to: size).png
}

func getIcon(pid: Int, size: Int) -> Data? {
	return NSRunningApplication(processIdentifier: pid_t(pid))?.icon?.resizedForFile(to: size).png
}

guard let icon: Data = {
	let isPid = CLI.arguments[2] == "true"
	if isPid {
		return getIcon(pid: Int(CLI.arguments[0])!, size: Int(CLI.arguments[1])!)
	} else {
		return getIcon(input: CLI.arguments[0], size: Int(CLI.arguments[1])!)
	}
}() else {
	CLI.printErr("Couldn't find: \(CLI.arguments[0])")
	exit(1)
}

if CLI.arguments.count >= 4 {
	do {
		try icon.write(to: URL(fileURLWithPath: CLI.arguments[3]), options: .atomic)
	} catch {
		CLI.printErr(error)
		exit(1)
	}
}

CLI.stdout.write(icon)
