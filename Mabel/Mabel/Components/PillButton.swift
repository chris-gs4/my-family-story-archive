import SwiftUI

struct PillButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(PillButtonStyle(isSelected: isSelected))
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
