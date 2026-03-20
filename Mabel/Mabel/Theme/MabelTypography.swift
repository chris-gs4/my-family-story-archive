import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// Typography tokens for the Mabel design system.
///
/// All text in the app uses Comfortaa (custom Google Font). NEVER fall back to system font.
/// All sizes scale with Dynamic Type via UIFontMetrics.
///
/// Usage:
/// ```swift
/// Text("Tell your story")
///     .font(MabelTypography.heroHeading())
/// // or via modifier:
/// Text("Tell your story")
///     .heroHeadingStyle()
/// ```
struct MabelTypography {

    // MARK: - Dynamic Type Scaling

    /// Scale a base point size according to the user's Dynamic Type setting.
    private static func scaled(_ size: CGFloat, relativeTo textStyle: Font.TextStyle) -> CGFloat {
        #if canImport(UIKit)
        let uiStyle: UIFont.TextStyle = {
            switch textStyle {
            case .largeTitle: return .largeTitle
            case .title:      return .title1
            case .title2:     return .title2
            case .title3:     return .title3
            case .headline:   return .headline
            case .subheadline: return .subheadline
            case .body:       return .body
            case .callout:    return .callout
            case .caption:    return .caption1
            case .caption2:   return .caption2
            case .footnote:   return .footnote
            @unknown default: return .body
            }
        }()
        return UIFontMetrics(forTextStyle: uiStyle).scaledValue(for: size)
        #else
        return size
        #endif
    }

    // MARK: - Heading Styles

    /// Main screen headlines — ExtraBold 32pt
    /// Tracking: -0.02em, Line height: 1.25
    static func heroHeading() -> Font {
        .comfortaa(scaled(32, relativeTo: .largeTitle), weight: .bold)
    }

    /// Section titles — Bold 28pt
    /// Tracking: -0.02em, Line height: 1.25
    static func heading() -> Font {
        .comfortaa(scaled(28, relativeTo: .title), weight: .bold)
    }

    /// Secondary headings — Medium 20pt
    static func subheading() -> Font {
        .comfortaa(scaled(20, relativeTo: .title3), weight: .medium)
    }

    // MARK: - Body Styles

    /// Paragraphs, descriptions — Regular 16pt
    /// Line height: 1.6
    static func body() -> Font {
        .comfortaa(scaled(16, relativeTo: .body), weight: .regular)
    }

    /// Placeholders, captions, hints — Regular 14pt
    static func helper() -> Font {
        .comfortaa(scaled(14, relativeTo: .subheadline), weight: .regular)
    }

    /// Dates, metadata, fine print — Light 12pt
    static func smallLabel() -> Font {
        .comfortaa(scaled(12, relativeTo: .caption), weight: .light)
    }

    // MARK: - Label Styles

    /// Uppercase section labels ("FOR STORYTELLERS") — SemiBold 14pt
    /// Tracking: 0.08em, uppercase, mabelPrimary color
    static func sectionLabel() -> Font {
        .comfortaa(scaled(14, relativeTo: .subheadline), weight: .semiBold)
    }

    // MARK: - Interactive Elements

    /// CTA button text — Bold 17pt
    static func button() -> Font {
        .comfortaa(scaled(17, relativeTo: .headline), weight: .bold)
    }

    /// Pill button text — Regular 15pt (unselected) / SemiBold 15pt (selected)
    static func pillButton(selected: Bool = false) -> Font {
        .comfortaa(scaled(15, relativeTo: .subheadline), weight: selected ? .semiBold : .regular)
    }

    // MARK: - Specialized

    /// Timer display on recording screen — Medium 24pt
    static func timer() -> Font {
        .comfortaa(scaled(24, relativeTo: .title2), weight: .medium)
    }

    /// Story card title — Bold 20pt
    static func storyTitle() -> Font {
        .comfortaa(scaled(20, relativeTo: .title3), weight: .bold)
    }

    /// Prompt card title — Bold 22pt
    static func promptTitle() -> Font {
        .comfortaa(scaled(22, relativeTo: .title2), weight: .bold)
    }

    /// Progress text — SemiBold 16pt
    static func progress() -> Font {
        .comfortaa(scaled(16, relativeTo: .body), weight: .semiBold)
    }

    /// Badge text — SemiBold 14pt
    static func badge() -> Font {
        .comfortaa(scaled(14, relativeTo: .subheadline), weight: .semiBold)
    }

    // MARK: - Tracking Values

    /// Heading tracking: -0.02em (multiply by font size for points)
    static let headingTracking: CGFloat = -0.02

    /// Section label tracking: 0.08em
    static let sectionLabelTracking: CGFloat = 0.08
}

// MARK: - View Modifiers

struct HeroHeadingStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.heroHeading())
            .foregroundColor(MabelColors.text)
            .tracking(32 * MabelTypography.headingTracking)
            .lineSpacing(32 * 0.25) // line-height 1.25
    }
}

struct HeadingStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.heading())
            .foregroundColor(MabelColors.text)
            .tracking(28 * MabelTypography.headingTracking)
            .lineSpacing(28 * 0.25)
    }
}

struct SubheadingStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.subheading())
            .foregroundColor(MabelColors.text)
    }
}

struct BodyStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.body())
            .foregroundColor(MabelColors.text)
            .lineSpacing(16 * 0.6) // line-height 1.6
    }
}

struct HelperStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.helper())
            .foregroundColor(MabelColors.subtle)
    }
}

struct SmallLabelStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.smallLabel())
            .foregroundColor(MabelColors.subtle)
    }
}

struct SectionLabelStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(MabelTypography.sectionLabel())
            .foregroundColor(MabelColors.primary)
            .tracking(14 * MabelTypography.sectionLabelTracking)
            .textCase(.uppercase)
    }
}

extension View {
    /// Hero heading: ExtraBold 32pt, mabelText, -0.02em tracking
    func heroHeadingStyle() -> some View {
        modifier(HeroHeadingStyle())
    }

    /// Section heading: Bold 28pt, mabelText, -0.02em tracking
    func headingStyle() -> some View {
        modifier(HeadingStyle())
    }

    /// Secondary heading: Medium 20pt, mabelText
    func subheadingStyle() -> some View {
        modifier(SubheadingStyle())
    }

    /// Body text: Regular 16pt, mabelText, 1.6 line-height
    func bodyStyle() -> some View {
        modifier(BodyStyle())
    }

    /// Helper text: Regular 14pt, mabelSubtle
    func helperStyle() -> some View {
        modifier(HelperStyle())
    }

    /// Small label: Light 12pt, mabelSubtle
    func smallLabelStyle() -> some View {
        modifier(SmallLabelStyle())
    }

    /// Section label: SemiBold 14pt, mabelPrimary, uppercase, 0.08em tracking
    func sectionLabelStyle() -> some View {
        modifier(SectionLabelStyle())
    }
}
