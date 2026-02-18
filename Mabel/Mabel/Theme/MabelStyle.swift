import SwiftUI

struct CTAButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(18, weight: .bold))
            .foregroundColor(isDisabled ? .mabelSubtle : .mabelBackground)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                Capsule()
                    .fill(isDisabled ? Color.mabelSurface : Color.mabelTeal)
            )
            .clipShape(Capsule())
            .opacity(isDisabled ? 0.4 : 1.0)
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.3), value: configuration.isPressed)
    }
}

struct PillButtonStyle: ButtonStyle {
    var isSelected: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(15, weight: isSelected ? .bold : .regular))
            .foregroundColor(isSelected ? .white : .mabelText)
            .padding(.horizontal, 20)
            .frame(height: 44)
            .background(
                Capsule()
                    .fill(isSelected ? Color.mabelTeal : Color.mabelSurface)
            )
            .overlay(
                Capsule()
                    .strokeBorder(isSelected ? Color.clear : Color.mabelSubtle.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
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
