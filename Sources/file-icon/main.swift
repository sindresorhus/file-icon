import Cocoa

extension NSBitmapImageRep {
	func png() -> Data? {
		return representation(using: .png, properties: [:])
	}
}

extension Data {
	var bitmap: NSBitmapImageRep? {
		return NSBitmapImageRep(data: self)
	}
}

extension NSImage {
	func png() -> Data? {
		return tiffRepresentation?.bitmap?.png()
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

	return ws.icon(forFile: path).resizedForFile(to: size).png()
}

func getIcon(pid: Int, size: Int) -> Data? {
	return NSRunningApplication(processIdentifier: pid_t(pid))?.icon?.resizedForFile(to: size).png()
}

let input = CLI.arguments[0]
let size = Int(CLI.arguments[1])!
let isPid = CLI.arguments[2] == "true"

guard let icon: Data = {
	if isPid {
		return getIcon(pid: Int(input)!, size: size)
	} else {
		return getIcon(input: input, size: size)
	}
}() else {
	CLI.printErr("Couldn't find: \(input)")
	exit(1)
}

if CLI.arguments.count >= 4 {
	let destination = CLI.arguments[3]
	
	do {
		try icon.write(to: URL(fileURLWithPath: destination), options: .atomic)
	} catch {
		CLI.printErr(error)
		exit(1)
	}
}

CLI.stdout.write(icon)
