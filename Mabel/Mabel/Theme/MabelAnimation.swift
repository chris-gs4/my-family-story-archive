import SwiftUI

/// Named animation presets and transitions for Mabel.
///
/// Centralizes animation timing so buttons, recording UI, and transitions
/// all share consistent motion language. Zero hardcoded durations in view files.
///
/// Usage:
/// ```swift
/// .animation(MabelAnimation.ctaPress, value: isPressed)
/// .scaleEffect(isPressed ? MabelAnimation.ctaPressScale : 1.0)
/// ```
struct MabelAnimation {

    // MARK: - Button Animations

    /// CTA button press spring — response 0.3
    static let ctaPress: Animation = .spring(response: 0.3)

    /// CTA button press scale value
    static let ctaPressScale: CGFloat = 0.98

    /// Pill button selection spring — response 0.3, damping 0.6
    static let pillSelect: Animation = .spring(response: 0.3, dampingFraction: 0.6)

    /// Pill button press scale value
    static let pillPressScale: CGFloat = 0.95

    // MARK: - Recording

    /// Mic button pulse — repeating scale/opacity animation
    static let micPulse: Animation = .easeInOut(duration: 1.5).repeatForever(autoreverses: true)

    /// Mic pulse scale range: 1.0 → 1.08
    static let micPulseScale: CGFloat = 1.08

    /// Mic pulse opacity range: 1.0 → 0.7
    static let micPulseOpacity: Double = 0.7

    /// Waveform bar update interval
    static let waveformInterval: TimeInterval = 0.1

    // MARK: - Input Focus

    /// Text input focus border transition
    static let focusTransition: Animation = .easeInOut(duration: 0.2)

    // MARK: - General

    /// Subtle animation for small state changes
    static let subtle: Animation = .easeInOut(duration: 0.2)

    /// Card tap feedback
    static let cardTap: Animation = .spring(response: 0.3)

    /// Card tap scale value
    static let cardTapScale: CGFloat = 0.98

    // MARK: - Transitions

    /// Slide up from bottom with fade
    static var slideUp: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .bottom).combined(with: .opacity),
            removal: .opacity
        )
    }

    /// Scale up with fade — for feedback elements
    static var fadeScale: AnyTransition {
        .asymmetric(
            insertion: .scale(scale: 0.8).combined(with: .opacity),
            removal: .opacity
        )
    }
}
