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

let apps = CLI.arguments[0].components(separatedBy: ",")
let size = Int(CLI.arguments[1])!
let isPid = CLI.arguments[2].components(separatedBy: ",")
let writeToFile = CLI.arguments.count >= 4
let destinations = writeToFile ?
	CLI.arguments[3].components(separatedBy: ",") :
	[];

for (i, app) in apps.enumerated() {
	guard let icon: Data = {
		if isPid[i] == "true" {
			return getIcon(pid: Int(app)!, size: size)
		} else {
			return getIcon(input: app, size: size)
		}
	}() else {
		print("Couldn't find: \(app)", to: .standardError)
		exit(1)
	}

	if writeToFile {
		CLI.tryOrExit {
			try icon.write(to: URL(fileURLWithPath: destinations[i]), options: .atomic)
		}
	}

	CLI.standardOutput.write(icon)
	if (apps.count > 1) {
		CLI.standardOutput.write("<EOF>")
	}
}
