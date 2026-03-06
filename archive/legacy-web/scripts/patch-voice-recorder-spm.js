#!/usr/bin/env node

/**
 * Patches capacitor-voice-recorder to add SPM (Package.swift) support.
 *
 * The capacitor-voice-recorder plugin only ships with CocoaPods support,
 * but Capacitor 8 defaults to SPM. This script creates a Package.swift
 * in the plugin's node_modules directory so cap sync can include it.
 *
 * Run via: npm postinstall or manually before `npx cap sync ios`
 */

const fs = require('fs');
const path = require('path');

const pluginDir = path.join(__dirname, '..', 'node_modules', 'capacitor-voice-recorder');
const packageSwiftPath = path.join(pluginDir, 'Package.swift');
const pluginSrcDir = path.join(pluginDir, 'ios', 'Plugin');

if (!fs.existsSync(pluginDir)) {
  console.log('[patch] capacitor-voice-recorder not found, skipping');
  process.exit(0);
}

// Always re-generate to ensure the patch is up to date
const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorVoiceRecorder",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "CapacitorVoiceRecorder",
            targets: ["VoiceRecorderPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "VoiceRecorderPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin",
            exclude: ["Info.plist"])
    ]
)
`;

fs.writeFileSync(packageSwiftPath, packageSwift);
console.log('[patch] Created/updated Package.swift for capacitor-voice-recorder (SPM support)');

// Remove Obj-C files that cause mixed-language errors in SPM
// The CAP_PLUGIN registration in .m is handled by @objc in Swift for SPM builds
const filesToRemove = ['VoiceRecorderPlugin.h', 'VoiceRecorderPlugin.m'];
for (const file of filesToRemove) {
  const filePath = path.join(pluginSrcDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`[patch] Removed ${file} (incompatible with SPM mixed-language restriction)`);
  }
}
