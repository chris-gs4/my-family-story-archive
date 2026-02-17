import SwiftUI

struct CTAButton: View {
    let title: String
    var isDisabled: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(CTAButtonStyle(isDisabled: isDisabled))
        .disabled(isDisabled)
    }
}

#Preview {
    VStack(spacing: 16) {
        CTAButton(title: "Get Started") {}
        CTAButton(title: "Disabled", isDisabled: true) {}
    }
    .padding(24)
    .background(Color.mabelBackground)
}
