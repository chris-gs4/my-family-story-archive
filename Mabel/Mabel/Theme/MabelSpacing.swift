import SwiftUI

/// Spacing and layout tokens for the Mabel design system.
///
/// All values align to an 8pt base grid. Zero hardcoded spacing values
/// should exist in view files — use these tokens exclusively.
///
/// Usage:
/// ```swift
/// .padding(.horizontal, MabelSpacing.screenPadH)
/// // or via modifier:
/// .screenPadding()
/// ```
struct MabelSpacing {

    // MARK: - Base Grid (8pt)

    /// 4pt — micro spacing
    static let xs: CGFloat = 4

    /// 8pt — tight gap between closely related elements
    static let sm: CGFloat = 8

    /// 12pt — small gap
    static let md: CGFloat = 12

    /// 16pt — element gap within a section
    static let lg: CGFloat = 16

    /// 24pt — horizontal screen padding
    static let xl: CGFloat = 24

    /// 32pt — section gap between major sections
    static let xxl: CGFloat = 32

    /// 40pt — bottom safe area minimum
    static let xxxl: CGFloat = 40

    // MARK: - Semantic Screen Layout

    /// Horizontal padding on ALL screens — 24pt
    static let screenPadH: CGFloat = xl

    /// Between major sections — 32pt
    static let sectionGap: CGFloat = xxl

    /// Between elements within a section — 16pt
    static let elementGap: CGFloat = lg

    /// Between closely related elements — 8pt
    static let tightGap: CGFloat = sm

    /// Minimum bottom padding above safe area — 40pt
    static let bottomSafe: CGFloat = xxxl

    /// Minimum top padding below safe area — 16pt
    static let topSafe: CGFloat = lg

    // MARK: - Component Padding

    /// General card internal padding — 16pt
    static let cardPaddingGeneral: CGFloat = lg

    /// Content card internal padding — 20pt
    static let cardPaddingContent: CGFloat = 20

    /// Pill button horizontal padding — 12pt
    static let pillPadH: CGFloat = md

    /// Pill button vertical padding — 10pt
    static let pillPadV: CGFloat = 10

    /// Text input horizontal padding — 16pt
    static let inputPadH: CGFloat = lg

    /// Text input vertical padding — 14pt
    static let inputPadV: CGFloat = 14

    // MARK: - Corner Radius

    /// Content cards — 20pt
    static let cornerRadiusCard: CGFloat = 20

    /// Suggestion cards — 16pt
    static let cornerRadiusSuggestion: CGFloat = 16

    /// Pill buttons, text inputs — 14pt
    static let cornerRadiusPill: CGFloat = 14

    /// Percentage badges — 12pt
    static let cornerRadiusBadge: CGFloat = 12

    /// CTA buttons — full capsule
    static let cornerRadiusCapsule: CGFloat = .infinity

    // MARK: - Border Widths

    /// Standard card border — 1.5pt
    static let borderCard: CGFloat = 1.5

    /// Button/input border — 3pt
    static let borderButton: CGFloat = 3

    // MARK: - Component Sizes

    /// CTA button height — 56pt
    static let ctaHeight: CGFloat = 56

    /// Pill button minimum height — 48pt
    static let pillMinHeight: CGFloat = 48

    /// Wordmark height — 24pt
    static let wordmarkHeight: CGFloat = 24

    /// Chapter circle diameter — 36pt
    static let chapterCircle: CGFloat = 36

    /// Active chapter circle diameter — 40pt
    static let chapterCircleActive: CGFloat = 40

    /// Mic button diameter — 80pt
    static let micButton: CGFloat = 80

    /// FAB button diameter — 56pt
    static let fabButton: CGFloat = 56

    // MARK: - Mascot Sizes

    /// Welcome screen hero mascot — 220pt
    static let mascotHero: CGFloat = 220

    /// Library greeting mascot — 140pt
    static let mascotGreeting: CGFloat = 140

    /// Empty state mascot — 80pt
    static let mascotEmpty: CGFloat = 80

    /// Inline reference mascot — 60pt
    static let mascotInline: CGFloat = 60

    /// Small decorative mascot — 40pt
    static let mascotSmall: CGFloat = 40

    // MARK: - Icon Sizes

    /// Feature card icon — 26pt
    static let iconFeature: CGFloat = 26

    /// Trust indicator icon — 16pt
    static let iconTrust: CGFloat = 16

    /// Icon circle size (for feature cards) — 44pt
    static let iconCircle: CGFloat = 44

    // MARK: - Flow Layout

    /// Pill button grid horizontal spacing — 8pt
    static let flowH: CGFloat = sm

    /// Pill button grid vertical spacing — 8pt
    static let flowV: CGFloat = sm
}

// MARK: - View Modifiers

extension View {
    /// Apply standard 24pt horizontal screen padding.
    func screenPadding() -> some View {
        self.padding(.horizontal, MabelSpacing.screenPadH)
    }

    /// Apply content card internal padding (20pt).
    func cardPadding() -> some View {
        self.padding(MabelSpacing.cardPaddingContent)
    }

    /// Apply section gap as bottom spacing (32pt).
    func sectionSpacing() -> some View {
        self.padding(.bottom, MabelSpacing.sectionGap)
    }

    /// Apply element gap as bottom spacing (16pt).
    func elementSpacing() -> some View {
        self.padding(.bottom, MabelSpacing.elementGap)
    }

    /// Apply bottom safe area padding (40pt minimum).
    func bottomSafePadding() -> some View {
        self.padding(.bottom, MabelSpacing.bottomSafe)
    }

    /// Apply top safe area padding (16pt minimum).
    func topSafePadding() -> some View {
        self.padding(.top, MabelSpacing.topSafe)
    }
}
