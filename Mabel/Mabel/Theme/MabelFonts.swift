import SwiftUI

enum ComfortaaWeight: String {
    case light
    case regular
    case medium
    case semiBold
    case bold

    var fontWeight: Font.Weight {
        switch self {
        case .light: return .light
        case .regular: return .regular
        case .medium: return .medium
        case .semiBold: return .semibold
        case .bold: return .bold
        }
    }

    var uiFontWeight: CGFloat {
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
    static func comfortaa(_ size: CGFloat, weight: ComfortaaWeight = .regular) -> Font {
        // The variable font registers with the family name "Comfortaa"
        // Use the custom font with weight variation
        return .custom("Comfortaa", size: size).weight(weight.fontWeight)
    }
}

extension UIFont {
    static func comfortaa(_ size: CGFloat, weight: ComfortaaWeight = .regular) -> UIFont {
        let descriptor = UIFontDescriptor(fontAttributes: [
            .family: "Comfortaa",
            .traits: [UIFontDescriptor.TraitKey.weight: weight.uiFontWeight]
        ])
        return UIFont(descriptor: descriptor, size: size)
    }
}
