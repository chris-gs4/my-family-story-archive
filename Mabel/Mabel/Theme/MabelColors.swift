import SwiftUI

extension Color {
    // MARK: - Backgrounds
    static let mabelBackground = Color.white                                          // #FFFFFF — primary screen background
    static let mabelWarmBg = Color.white                                              // #FFFFFF — alias (legacy name, maps to white now)
    static let mabelBackgroundAlt = Color(red: 0.973, green: 0.957, blue: 0.949)     // #f8f4f2 — alternate section background for visual rhythm

    // MARK: - Text colors
    static let mabelText = Color(red: 0.176, green: 0.173, blue: 0.169)             // #2d2c2b — primary text, headings, body copy
    static let mabelSubtle = Color(red: 0.176, green: 0.173, blue: 0.169).opacity(0.6)  // #2d2c2b at 60% — helper text, placeholders, secondary labels

    // MARK: - Primary accent
    static let mabelPrimary = Color(red: 0.180, green: 0.490, blue: 0.420)          // #2E7D6B — CTA buttons, links, icons, active states
    static let mabelTeal = Color(red: 0.180, green: 0.490, blue: 0.420)             // #2E7D6B — alias for mabelPrimary
    static let mabelPrimaryDark = Color(red: 0.141, green: 0.408, blue: 0.349)      // #246859 — darker primary for pressed/hover states
    static let mabelTealDark = Color(red: 0.141, green: 0.408, blue: 0.349)         // #246859 — alias for mabelPrimaryDark
    static let mabelPrimaryLight = Color(red: 0.941, green: 0.980, blue: 0.969)     // #f0faf7 — light tint for icon circles, badge backgrounds

    // MARK: - Accent (decorative only)
    static let mabelAccent = Color(red: 0.976, green: 0.886, blue: 0.412)           // #f9e269 — warm highlights, decorative only. NEVER as full backgrounds.
    static let mabelGold = Color(red: 0.976, green: 0.886, blue: 0.412)             // #f9e269 — alias for mabelAccent

    // MARK: - Functional colors
    static let mabelBurgundy = Color(red: 0.639, green: 0.141, blue: 0.231)         // #A3243B — recording active state, destructive actions
    static let mabelSurface = Color.white                                             // #FFFFFF — cards, elevated surfaces
    static let mabelBorder = Color.black.opacity(0.08)                                // rgba(0,0,0,0.08) — subtle card/section borders
    static let mabelBorderWarm = Color(red: 0.910, green: 0.878, blue: 0.855)       // #e8e0da — warm card borders

    // MARK: - Component-specific
    static let mabelMintBadge = Color(red: 0.941, green: 0.980, blue: 0.969)        // #f0faf7 — badge backgrounds (same as primaryLight)
    static let mabelChapterGray = Color(red: 0.831, green: 0.816, blue: 0.800)      // #D4D0CC — incomplete chapter circles
    static let mabelCopper = Color(red: 0.690, green: 0.471, blue: 0.314)           // #B07850 — completed chapter indicators
}

/// Reusable background view — use on every screen per STYLE_GUIDE.md
struct MabelBackground: View {
    var body: some View {
        Color.mabelBackground
            .ignoresSafeArea(.all, edges: .all)
    }
}

/// Legacy alias — use MabelBackground instead
typealias MabelGradientBackground = MabelBackground
