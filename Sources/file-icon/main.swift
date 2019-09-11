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
	print("Couldn't find: \(input)", to: .standardError)
	exit(1)
}

if CLI.arguments.count >= 4 {
	let destination = CLI.arguments[3]
	
	CLI.tryOrExit {
		try icon.write(to: URL(fileURLWithPath: destination), options: .atomic)
	}
}

CLI.standardOutput.write(icon)
