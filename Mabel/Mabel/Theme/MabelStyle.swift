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
                    .strokeBorder(isDisabled ? Color.clear : Color.mabelTeal.opacity(0.8), lineWidth: 2)
            )
            .clipShape(Capsule())
            .shadow(color: isDisabled ? .clear : .black.opacity(0.12), radius: 8, x: 0, y: 4)
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
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(isDisabled ? Color.mabelSurface.opacity(0.4) : (isSelected ? Color.mabelTeal : Color.mabelSurface.opacity(0.9)))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .strokeBorder(
                        isSelected ? Color.clear : (isDisabled ? Color.mabelSubtle.opacity(0.15) : Color.mabelSubtle.opacity(0.3)),
                        lineWidth: isSelected ? 0 : 2
                    )
            )
            .shadow(color: isSelected ? .black.opacity(0.08) : .clear, radius: 4, x: 0, y: 2)
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
