import SwiftUI

struct CTAButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(MabelTypography.button())
            .foregroundColor(isDisabled ? MabelColors.subtle : .white)
            .frame(maxWidth: .infinity)
            .frame(height: MabelSpacing.ctaHeight)
            .background(
                Capsule()
                    .fill(isDisabled ? MabelColors.surface : MabelColors.primary)
            )
            .overlay(
                Capsule()
                    .strokeBorder(
                        isDisabled ? Color.clear : MabelColors.primary.opacity(0.8),
                        lineWidth: MabelSpacing.borderButton
                    )
            )
            .clipShape(Capsule())
            .mabelCtaShadow()
            .shadow(color: isDisabled ? .clear : .clear, radius: 0) // override shadow when disabled
            .opacity(isDisabled ? 0.4 : 1.0)
            .scaleEffect(configuration.isPressed && !isDisabled ? MabelAnimation.ctaPressScale : 1.0)
            .animation(MabelAnimation.ctaPress, value: configuration.isPressed)
    }
}

struct PillButtonStyle: ButtonStyle {
    var isSelected: Bool
    var isDisabled: Bool = false
    var isDashed: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(MabelTypography.pillButton(selected: isSelected))
            .italic(isDashed && !isSelected)
            .foregroundColor(
                isDisabled
                    ? MabelColors.subtle.opacity(0.5)
                    : (isSelected ? .white : (isDashed ? MabelColors.subtle : MabelColors.text))
            )
            .padding(.horizontal, MabelSpacing.pillPadH)
            .padding(.vertical, MabelSpacing.pillPadV)
            .frame(maxWidth: .infinity)
            .frame(minHeight: MabelSpacing.pillMinHeight)
            .background(
                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                    .fill(
                        isDisabled
                            ? AnyShapeStyle(Color.gray.opacity(0.15))
                            : (isSelected
                                ? AnyShapeStyle(MabelColors.primary)
                                : AnyShapeStyle(Color.white))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                    .strokeBorder(
                        isSelected ? MabelColors.primary : Color.gray.opacity(0.35),
                        lineWidth: MabelSpacing.borderButton,
                        antialiased: true
                    )
                    .opacity(isDashed && !isSelected ? 0 : 1)
            )
            .overlay(
                // Dashed border for unselected dashed variant
                isDashed && !isSelected
                    ? RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                        .strokeBorder(
                            style: StrokeStyle(lineWidth: MabelSpacing.borderButton, dash: [8, 5])
                        )
                        .foregroundColor(Color.gray.opacity(0.35))
                    : nil
            )
            .mabelPillShadow(selected: isSelected)
            .opacity(isDisabled ? 0.5 : 1.0)
            .scaleEffect(configuration.isPressed && !isDisabled ? MabelAnimation.pillPressScale : 1.0)
            .animation(MabelAnimation.pillSelect, value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(MabelTypography.badge())
            .foregroundColor(isDisabled ? MabelColors.subtle : MabelColors.primary)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                Capsule()
                    .strokeBorder(
                        isDisabled ? MabelColors.subtle.opacity(0.3) : MabelColors.primary,
                        lineWidth: MabelSpacing.borderCard
                    )
            )
            .opacity(isDisabled ? 0.5 : (configuration.isPressed ? 0.7 : 1.0))
    }
}

struct DestructiveSecondaryButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(MabelTypography.badge())
            .foregroundColor(isDisabled ? MabelColors.subtle : MabelColors.burgundy)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                Capsule()
                    .strokeBorder(
                        isDisabled ? MabelColors.subtle.opacity(0.3) : MabelColors.burgundy.opacity(0.5),
                        lineWidth: MabelSpacing.borderCard
                    )
            )
            .opacity(isDisabled ? 0.5 : (configuration.isPressed ? 0.7 : 1.0))
    }
}
