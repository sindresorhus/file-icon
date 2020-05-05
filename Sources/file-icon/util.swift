import Cocoa

extension NSBitmapImageRep {
	func png() -> Data? {
		representation(using: .png, properties: [:])
	}
}

extension Data {
	var bitmap: NSBitmapImageRep? { NSBitmapImageRep(data: self) }
}

extension NSImage {
	func png() -> Data? { tiffRepresentation?.bitmap?.png() }

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

extension FileHandle: TextOutputStream {
	public func write(_ string: String) {
		write(string.data(using: .utf8)!)
	}
}

extension String {
	var isInt: Bool { Int(self) != nil }
}

struct CLI {
	static var standardInput = FileHandle.standardInput
	static var standardOutput = FileHandle.standardOutput
	static var standardError = FileHandle.standardError

	static let arguments = Array(CommandLine.arguments.dropFirst(1))

	/// Execute code and print to `stderr` and exit with code 1 if it throws.
	static func tryOrExit(_ throwingFunc: () throws -> Void) {
		do {
			try throwingFunc()
		} catch {
			print(error.localizedDescription, to: .standardError)
			exit(1)
		}
	}
}

enum PrintOutputTarget {
	case standardOutput
	case standardError
}

/// Make `print()` accept an array of items.
/// Since Swift doesn't support spreading...
private func print<Target>(
	_ items: [Any],
	separator: String = " ",
	terminator: String = "\n",
	to output: inout Target
) where Target: TextOutputStream {
	let item = items.map { "\($0)" }.joined(separator: separator)
	Swift.print(item, terminator: terminator, to: &output)
}

func print(
	_ items: Any...,
	separator: String = " ",
	terminator: String = "\n",
	to output: PrintOutputTarget = .standardOutput
) {
	switch output {
	case .standardOutput:
		print(items, separator: separator, terminator: terminator)
	case .standardError:
		print(items, separator: separator, terminator: terminator, to: &CLI.standardError)
	}
}
