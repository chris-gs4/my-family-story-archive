import SwiftUI

struct CTAButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(17, weight: .bold))
            .foregroundColor(isDisabled ? .mabelSubtle : .white)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                Capsule()
                    .fill(isDisabled ? Color.mabelSurface : Color.mabelTeal)
            )
            .overlay(
                Capsule()
                    .strokeBorder(isDisabled ? Color.clear : Color.mabelTeal.opacity(0.8), lineWidth: 3)
            )
            .clipShape(Capsule())
            .shadow(color: isDisabled ? .clear : .black.opacity(0.15), radius: 10, x: 0, y: 4)
            .opacity(isDisabled ? 0.4 : 1.0)
            .scaleEffect(configuration.isPressed && !isDisabled ? 0.98 : 1.0)
            .animation(.spring(response: 0.3), value: configuration.isPressed)
    }
}

struct PillButtonStyle: ButtonStyle {
    var isSelected: Bool
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(15, weight: isSelected ? .semiBold : .regular))
            .foregroundColor(isDisabled ? .mabelSubtle.opacity(0.5) : (isSelected ? .white : .mabelText))
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 48)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        isDisabled
                            ? AnyShapeStyle(Color.gray.opacity(0.15))
                            : (isSelected
                                ? AnyShapeStyle(Color.mabelTeal)
                                : AnyShapeStyle(Color.white))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .strokeBorder(
                        isSelected ? Color.mabelTeal : (isDisabled ? Color.gray.opacity(0.35) : Color.gray.opacity(0.35)),
                        lineWidth: 3
                    )
            )
            .shadow(color: isSelected ? .mabelTeal.opacity(0.4) : .black.opacity(0.1), radius: isSelected ? 12 : 4, x: 0, y: isSelected ? 4 : 2)
            .opacity(isDisabled ? 0.5 : 1.0)
            .scaleEffect(configuration.isPressed && !isDisabled ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(14, weight: .medium))
            .foregroundColor(.mabelTeal)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
            )
            .opacity(configuration.isPressed ? 0.7 : 1.0)
    }
}
