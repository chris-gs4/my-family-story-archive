import SwiftUI

extension Color {
    // Primary background
    static let mabelWarmBg = Color(red: 0.953, green: 0.878, blue: 0.824)         // #F3E0D2 — warm peach/cream screen background
    static let mabelBackground = Color(red: 0.953, green: 0.878, blue: 0.824)     // #F3E0D2 — alias for mabelWarmBg

    // Text colors
    static let mabelText = Color(red: 0.176, green: 0.125, blue: 0.098)           // #2D2019 — primary text
    static let mabelGreeting = Color(red: 0.620, green: 0.522, blue: 0.471)       // #9E8578 — warm greeting/hero text
    static let mabelSubtle = Color(red: 0.478, green: 0.443, blue: 0.408)         // #7A7168 — helper text, placeholders

    // Accent colors
    static let mabelTeal = Color(red: 0.122, green: 0.478, blue: 0.435)           // #1F7A6F — CTA, primary accent
    static let mabelTealDark = Color(red: 0.08, green: 0.38, blue: 0.35)          // #146159 — darker teal variant
    static let mabelBurgundy = Color(red: 0.639, green: 0.141, blue: 0.231)       // #A3243B — recording state
    static let mabelGold = Color(red: 0.914, green: 0.769, blue: 0.416)           // #E9C46A — warm highlights, decorative
    static let mabelCopper = Color(red: 0.690, green: 0.471, blue: 0.314)         // #B07850 — completed chapters

    // Surface & badge colors
    static let mabelSurface = Color.white                                          // #FFFFFF — cards, elevated surfaces
    static let mabelMintBadge = Color(red: 0.831, green: 0.941, blue: 0.925)      // #D4F0EC — percentage badge background
    static let mabelChapterGray = Color(red: 0.831, green: 0.816, blue: 0.800)    // #D4D0CC — incomplete chapter circles
}

/// Reusable background view — use on every screen per STYLE_GUIDE.md
struct MabelBackground: View {
    var body: some View {
        Color.mabelWarmBg
            .ignoresSafeArea(.all, edges: .all)
    }
}

/// Legacy alias — use MabelBackground instead
typealias MabelGradientBackground = MabelBackground
