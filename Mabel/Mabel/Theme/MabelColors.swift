import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

// MARK: - Hex Initializer

extension Color {
    /// Initialize a Color from a hex string (e.g., "2E7D6B" or "#2E7D6B")
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Mabel Design Token Colors

/// Mabel design system color palette.
///
/// All colors are defined as adaptive tokens that auto-switch for light/dark mode.
/// Zero hardcoded color values should exist in view files — use these tokens exclusively.
struct MabelColors {

    // MARK: - Adaptive Helpers

    /// Create a Color that adapts between light and dark mode using hex strings.
    private static func adaptive(light: String, dark: String) -> Color {
        #if canImport(UIKit)
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: dark))
                : UIColor(Color(hex: light))
        })
        #else
        Color(hex: light)
        #endif
    }

    // MARK: - Surface Hierarchy

    /// Primary screen background — white
    static let background = adaptive(light: "FFFFFF", dark: "1C1C1E")

    /// Alternate section background for visual rhythm
    static let backgroundAlt = adaptive(light: "F8F4F2", dark: "2C2C2E")

    /// Cards, elevated surfaces
    static let surface = adaptive(light: "FFFFFF", dark: "2C2C2E")

    /// Gradient end color — soft sage/mint for subtle top-to-bottom gradients
    static let backgroundGradientEnd = adaptive(light: "D5DFDB", dark: "2A3230")

    // MARK: - Text Hierarchy

    /// ALL text — headings, body, labels. Never use pure black.
    static let text = adaptive(light: "2D2C2B", dark: "F2EDE4")

    /// Helper text, placeholders, secondary labels — text at 60% opacity
    static var subtle: Color {
        text.opacity(0.6)
    }

    // MARK: - Primary Brand Color

    /// CTA buttons, links, icons, active states, section labels
    static let primary = adaptive(light: "2E7D6B", dark: "4CA894")

    /// Pressed/hover state for primary elements
    static let primaryDark = adaptive(light: "246859", dark: "3D8E7E")

    /// Icon circle backgrounds, badge tints, pill fills
    static let primaryLight = adaptive(light: "F0FAF7", dark: "1A3D34")

    // MARK: - Accent (Decorative Only)

    /// Decorative only — mascot glow, highlights. NEVER as full backgrounds.
    static let accent = adaptive(light: "F9E269", dark: "F9E269")

    // MARK: - Functional Colors

    /// Recording active state, destructive actions
    static let burgundy = adaptive(light: "A3243B", dark: "D44A5E")

    /// Default subtle borders
    static let border = Color.black.opacity(0.08)

    /// Warm card borders
    static let borderWarm = adaptive(light: "E8E0DA", dark: "3A3632")

    // MARK: - Component-Specific

    /// Badge backgrounds (same as primaryLight)
    static let mintBadge = primaryLight

    /// Incomplete chapter circle backgrounds
    static let chapterGray = adaptive(light: "D4D0CC", dark: "48443F")

    /// Completed chapter indicators
    static let copper = adaptive(light: "B07850", dark: "D09870")
}

// MARK: - Color Extension (API surface for views)

/// These static properties provide the `Color.mabelXxx` API used throughout all views.
/// They delegate to `MabelColors` so there is a single source of truth.
extension Color {
    // Backgrounds
    static let mabelBackground = MabelColors.background
    static let mabelWarmBg = MabelColors.background
    static let mabelBackgroundAlt = MabelColors.backgroundAlt
    static let mabelBackgroundGradientEnd = MabelColors.backgroundGradientEnd

    // Text
    static let mabelText = MabelColors.text
    static var mabelSubtle: Color { MabelColors.subtle }

    // Primary
    static let mabelPrimary = MabelColors.primary
    static let mabelTeal = MabelColors.primary
    static let mabelPrimaryDark = MabelColors.primaryDark
    static let mabelTealDark = MabelColors.primaryDark
    static let mabelPrimaryLight = MabelColors.primaryLight

    // Accent
    static let mabelAccent = MabelColors.accent
    static let mabelGold = MabelColors.accent

    // Functional
    static let mabelBurgundy = MabelColors.burgundy
    static let mabelSurface = MabelColors.surface
    static let mabelBorder = MabelColors.border
    static let mabelBorderWarm = MabelColors.borderWarm

    // Component-specific
    static let mabelMintBadge = MabelColors.mintBadge
    static let mabelChapterGray = MabelColors.chapterGray
    static let mabelCopper = MabelColors.copper
}

// MARK: - Reusable Background View

/// Reusable background view — use on every screen per STYLE_GUIDE.md
struct MabelBackground: View {
    var body: some View {
        MabelColors.background
            .ignoresSafeArea(.all, edges: .all)
    }
}

/// Legacy alias — use MabelBackground instead
typealias MabelGradientBackground = MabelBackground
