import SwiftUI

struct CTAButtonStyle: ButtonStyle {
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(17, weight: .bold))
            .foregroundColor(isDisabled ? .mabelSubtle : .mabelBackground)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                Capsule()
                    .fill(isDisabled ? Color.mabelSurface : Color.mabelTeal)
            )
            .opacity(configuration.isPressed ? 0.85 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct PillButtonStyle: ButtonStyle {
    var isSelected: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.comfortaa(14, weight: isSelected ? .bold : .regular))
            .foregroundColor(isSelected ? .mabelBackground : .mabelText)
            .padding(.horizontal, 18)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(isSelected ? Color.mabelTeal : Color.mabelSurface)
            )
            .overlay(
                Capsule()
                    .strokeBorder(isSelected ? Color.clear : Color.mabelSubtle.opacity(0.3), lineWidth: 1)
            )
            .opacity(configuration.isPressed ? 0.85 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
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
