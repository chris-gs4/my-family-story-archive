import SwiftUI

struct SecondaryButton: View {
    let title: String
    var isDisabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(SecondaryButtonStyle(isDisabled: isDisabled))
        .disabled(isDisabled)
    }
}

struct DestructiveButton: View {
    let title: String
    var isDisabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(DestructiveSecondaryButtonStyle(isDisabled: isDisabled))
        .disabled(isDisabled)
    }
}

#Preview {
    VStack(spacing: 16) {
        SecondaryButton(title: "REQUEST CHANGES") {}
        SecondaryButton(title: "Disabled", isDisabled: true) {}
        DestructiveButton(title: "LOG OUT") {}
        DestructiveButton(title: "Disabled", isDisabled: true) {}
    }
    .padding(24)
    .background(Color.mabelBackground)
}
