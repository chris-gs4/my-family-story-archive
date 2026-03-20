import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// Semantic haptic feedback for Mabel interactions.
///
/// Each method pre-prepares its generator for zero-latency playback.
/// Use semantic method names — never call UIKit haptics directly in views.
///
/// Usage:
/// ```swift
/// MabelHaptics.buttonTap()
/// MabelHaptics.memorySaved()
/// ```
struct MabelHaptics {

    // MARK: - Button & Navigation

    /// Light tap for any button press
    static func buttonTap() {
        #if canImport(UIKit)
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.prepare()
        generator.impactOccurred()
        #endif
    }

    /// Selection tick for pill button tap
    static func pillSelected() {
        #if canImport(UIKit)
        let generator = UISelectionFeedbackGenerator()
        generator.prepare()
        generator.selectionChanged()
        #endif
    }

    // MARK: - Recording

    /// Medium impact for mic button tap (start recording)
    static func startRecording() {
        #if canImport(UIKit)
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.prepare()
        generator.impactOccurred()
        #endif
    }

    /// Medium impact for stop/save recording
    static func stopRecording() {
        #if canImport(UIKit)
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.prepare()
        generator.impactOccurred()
        #endif
    }

    // MARK: - Success / Milestones

    /// Success notification when a memory is saved
    static func memorySaved() {
        #if canImport(UIKit)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.success)
        #endif
    }

    /// Success notification for chapter completion milestone
    static func chapterComplete() {
        #if canImport(UIKit)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.success)
        #endif
    }

    // MARK: - Error / Warning

    /// Error notification for destructive actions or failures
    static func error() {
        #if canImport(UIKit)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.error)
        #endif
    }

    /// Warning notification
    static func warning() {
        #if canImport(UIKit)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.warning)
        #endif
    }
}
