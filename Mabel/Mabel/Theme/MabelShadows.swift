import SwiftUI

/// Shadow tokens for the Mabel design system.
///
/// All shadows adapt between light and dark mode via @Environment(\.colorScheme).
/// Zero hardcoded shadow values should exist in view files.
///
/// Usage:
/// ```swift
/// .mabelCardShadow()
/// .mabelCtaShadow()
/// .mabelPillShadow(selected: true)
/// ```
struct MabelShadows {

    // MARK: - Shadow Specs (for reference)

    /// Card: black 0.06, radius 8, y 2
    /// CTA button: black 0.15, radius 10, y 4
    /// Pill selected: primary 0.4, radius 12, y 4
    /// Pill unselected: black 0.1, radius 4, y 2
    /// Text input unfocused: black 0.1, radius 6, y 3
    /// Text input focused: primary 0.3, radius 10 + black 0.1, radius 6, y 3
}

// MARK: - Card Shadow

struct CardShadowModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let isDark = colorScheme == .dark
        content
            .shadow(
                color: Color.black.opacity(isDark ? 0.25 : 0.06),
                radius: isDark ? 12 : 8,
                x: 0,
                y: isDark ? 4 : 2
            )
    }
}

// MARK: - CTA Button Shadow

struct CTAShadowModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let isDark = colorScheme == .dark
        content
            .shadow(
                color: Color.black.opacity(isDark ? 0.40 : 0.15),
                radius: isDark ? 14 : 10,
                x: 0,
                y: isDark ? 6 : 4
            )
    }
}

// MARK: - Pill Button Shadow

struct PillShadowModifier: ViewModifier {
    let selected: Bool
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        if selected {
            content
                .shadow(
                    color: MabelColors.primary.opacity(0.4),
                    radius: 12,
                    x: 0,
                    y: 4
                )
        } else {
            let isDark = colorScheme == .dark
            content
                .shadow(
                    color: Color.black.opacity(isDark ? 0.25 : 0.1),
                    radius: isDark ? 6 : 4,
                    x: 0,
                    y: 2
                )
        }
    }
}

// MARK: - Subtle Shadow

struct SubtleShadowModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let isDark = colorScheme == .dark
        content
            .shadow(
                color: Color.black.opacity(isDark ? 0.20 : 0.1),
                radius: isDark ? 6 : 4,
                x: 0,
                y: 2
            )
    }
}

// MARK: - Input Shadow

struct InputShadowModifier: ViewModifier {
    let focused: Bool
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let isDark = colorScheme == .dark
        if focused {
            content
                .shadow(
                    color: MabelColors.primary.opacity(0.3),
                    radius: 10,
                    x: 0,
                    y: 0
                )
                .shadow(
                    color: Color.black.opacity(isDark ? 0.25 : 0.1),
                    radius: 6,
                    x: 0,
                    y: 3
                )
        } else {
            content
                .shadow(
                    color: Color.black.opacity(isDark ? 0.25 : 0.1),
                    radius: 6,
                    x: 0,
                    y: 3
                )
        }
    }
}

// MARK: - View Extensions

extension View {
    /// Card shadow: soft warm shadow for content cards.
    func mabelCardShadow() -> some View {
        modifier(CardShadowModifier())
    }

    /// CTA button shadow: prominent shadow for primary action buttons.
    func mabelCtaShadow() -> some View {
        modifier(CTAShadowModifier())
    }

    /// Pill button shadow: tinted glow when selected, subtle when not.
    func mabelPillShadow(selected: Bool) -> some View {
        modifier(PillShadowModifier(selected: selected))
    }

    /// Subtle shadow for unselected/secondary elements.
    func mabelSubtleShadow() -> some View {
        modifier(SubtleShadowModifier())
    }

    /// Text input shadow: with teal glow when focused.
    func mabelInputShadow(focused: Bool) -> some View {
        modifier(InputShadowModifier(focused: focused))
    }
}
