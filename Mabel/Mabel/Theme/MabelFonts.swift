import SwiftUI

/// Scale a size relative to a 390pt-wide baseline (iPhone 15).
/// On iPhone SE (375pt): 200 → 192, on iPhone 15 Pro Max (430pt): 200 → 220.
func scaled(_ value: CGFloat) -> CGFloat {
    let screenWidth = UIScreen.main.bounds.width
    return value * (screenWidth / 390)
}

enum ComfortaaWeight: String {
    case light
    case regular
    case medium
    case semiBold
    case bold

    /// CSS/OpenType weight value for the `wght` variation axis
    var axisValue: CGFloat {
        switch self {
        case .light: return 300
        case .regular: return 400
        case .medium: return 500
        case .semiBold: return 600
        case .bold: return 700
        }
    }
}

extension Font {
    /// Create a Comfortaa font at the given size and weight.
    /// Bridges through UIFont to set the variable-font weight axis correctly.
    /// SwiftUI's `.weight()` modifier does NOT work with `.custom()` fonts.
    static func comfortaa(_ size: CGFloat, weight: ComfortaaWeight = .regular) -> Font {
        return Font(UIFont.comfortaa(size, weight: weight))
    }
}

extension UIFont {
    /// The OpenType tag for the `wght` (weight) variation axis.
    /// Decimal value of the tag bytes 'w','g','h','t'.
    private static let wghtAxisTag: Int = 2003265652

    static func comfortaa(_ size: CGFloat, weight: ComfortaaWeight = .regular) -> UIFont {
        // First, try the variation-axis approach: get the base font by PostScript name,
        // then apply the wght axis to select the desired weight.
        if let baseFont = UIFont(name: "Comfortaa-Regular", size: size) {
            let variationAttributes: [UIFontDescriptor.AttributeName: Any] = [
                kCTFontVariationAttribute as UIFontDescriptor.AttributeName: [
                    wghtAxisTag: weight.axisValue
                ]
            ]
            let varDescriptor = baseFont.fontDescriptor.addingAttributes(variationAttributes)
            return UIFont(descriptor: varDescriptor, size: size)
        }

        // Fallback: try by family name with trait weight
        let descriptor = UIFontDescriptor(fontAttributes: [
            .family: "Comfortaa"
        ])
        let font = UIFont(descriptor: descriptor, size: size)
        if font.familyName.lowercased().contains("comfortaa") {
            return font
        }

        // Should never reach here if font is bundled correctly
        print("⚠️ Comfortaa font not found! Check Info.plist UIAppFonts and Copy Bundle Resources.")
        return .systemFont(ofSize: size)
    }
}
