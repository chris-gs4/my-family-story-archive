import SwiftUI

extension Color {
    static let mabelBackground = Color(red: 1.0, green: 0.973, blue: 0.941)       // #FFF8F0 — fallback only
    static let mabelText = Color(red: 0.176, green: 0.125, blue: 0.098)           // #2D2019
    static let mabelTeal = Color(red: 0.122, green: 0.478, blue: 0.435)           // #1F7A6F
    static let mabelBurgundy = Color(red: 0.639, green: 0.141, blue: 0.231)       // #A3243B
    static let mabelGold = Color(red: 0.914, green: 0.769, blue: 0.416)           // #E9C46A
    static let mabelSurface = Color(red: 0.961, green: 0.929, blue: 0.890)        // #F5EDE3
    static let mabelSubtle = Color(red: 0.478, green: 0.443, blue: 0.408)         // #7A7168

    // Gradient tokens
    static let mabelGradientTop = Color(red: 0.682, green: 0.941, blue: 0.925)    // #AEF0EC
    static let mabelGradientMid = Color(red: 0.851, green: 0.957, blue: 0.937)    // #D9F4EF
    static let mabelGradientBot = Color(red: 0.992, green: 0.969, blue: 0.914)    // #FDF7E9
}

/// Reusable gradient background view — use on every screen per STYLE_GUIDE.md
struct MabelGradientBackground: View {
    var body: some View {
        Image("GradientBackground")
            .resizable()
            .scaledToFill()
            .ignoresSafeArea(.all, edges: .all)
    }
}
