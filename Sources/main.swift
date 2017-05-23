import Cocoa

extension NSBitmapImageRep {
	var png: Data? {
		return representation(using: .PNG, properties: [:])
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
		let newSize = size / Int(NSScreen.main()?.backingScaleFactor ?? 1)
		let img = NSImage(size: CGSize(width: newSize, height: newSize))
		img.lockFocus()
		let ctx = NSGraphicsContext.current()
		ctx?.imageInterpolation = .high
		draw(
			in: CGRect(x: 0, y: 0, width: newSize, height: newSize),
			from: CGRect(x: 0, y: 0, width: self.size.width, height: self.size.height),
			operation: .copy,
			fraction: 1
		)
		img.unlockFocus()
		return img
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
	static func printErr(_ item: Any) {
		print(item, to: &_stderr)
	}

	static var args: [String] {
		return Array(CommandLine.arguments.dropFirst(1))
	}
}

func getIcon(input: String, size: Int) -> Data? {
	let ws = NSWorkspace.shared()

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

guard let iconData = getIcon(input: CLI.args[0], size: Int(CLI.args[1])!) else {
	CLI.printErr("Couldn't find: \(CLI.args[0])")
	exit(1)
}

if (CLI.args.count >= 3) {
	do {
		try iconData.write(to: URL(fileURLWithPath: CLI.args[2]), options: .atomic)
	} catch {
		CLI.printErr(error);
		exit(1);
	}
}

CLI.stdout.write(iconData)
