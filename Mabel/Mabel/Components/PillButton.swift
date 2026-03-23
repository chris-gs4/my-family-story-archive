import SwiftUI

struct PillButton: View {
    let title: String
    let isSelected: Bool
    var isDisabled: Bool = false
    var isDashed: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(PillButtonStyle(isSelected: isSelected, isDisabled: isDisabled, isDashed: isDashed))
        .disabled(isDisabled)
    }
}

#Preview {
    HStack(spacing: 8) {
        PillButton(title: "Myself", isSelected: true) {}
        PillButton(title: "A Parent", isSelected: false) {}
        PillButton(title: "Other", isSelected: false) {}
    }
    .padding()
    .background(Color.mabelBackground)
}
