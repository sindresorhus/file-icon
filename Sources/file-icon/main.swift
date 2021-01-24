import Cocoa

func getIcon(input: String, size: Int) -> Data? {
	let path = (
		input.contains(".") ?
			NSWorkspace.shared.absolutePathForApplication(withBundleIdentifier: input) :
			NSWorkspace.shared.fullPath(forApplication: input)
	) ?? input

	guard FileManager.default.fileExists(atPath: path) else {
		return nil
	}

	return NSWorkspace.shared.icon(forFile: path).resizedForFile(to: size).png()
}

func getIcon(pid: Int, size: Int) -> Data? {
	NSRunningApplication(processIdentifier: pid_t(pid))?.icon?.resizedForFile(to: size).png()
}

struct Input: Codable {
	let appOrPID: String
	let size: Int
	let destination: String?
}

let decoder = JSONDecoder()
let data = Data(CLI.arguments[0].utf8)

var inputs = [Input]();
CLI.tryOrExit {
	inputs = try decoder.decode([Input].self, from: data)
}

for input in inputs {
	guard let icon: Data = {
		if let pid = Int(input.appOrPID) {
			return getIcon(pid: pid, size: input.size)
		} else {
			return getIcon(input: input.appOrPID, size: input.size)
		}
	}() else {
		print("Couldn't find: \(input.appOrPID)", to: .standardError)
		exit(1)
	}

	// Assumes that `input.destination` is set for all or none of the inputs.
	if let destination = input.destination {
		CLI.tryOrExit {
			try icon.write(to: URL(fileURLWithPath: destination, isDirectory: false), options: .atomic)
		}
	} else {
		CLI.standardOutput.write(icon)

		if inputs.count > 1 {
			CLI.standardOutput.write("<EOF>")
		}
	}
}
