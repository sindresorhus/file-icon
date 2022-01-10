// swift-tools-version:5.5
import PackageDescription

let package = Package(
	name: "FileIcon",
	platforms: [
		.macOS(.v10_10)
	],
	products: [
		.executable(
			name: "file-icon",
			targets: [
				"FileIconCLI"
			]
		)
	],
	targets: [
		.executableTarget(
			name: "FileIconCLI"
		)
	]
)
