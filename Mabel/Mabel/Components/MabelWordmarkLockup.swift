import SwiftUI

struct MabelWordmarkLockup: View {
    var body: some View {
        HStack(spacing: MabelSpacing.tightGap) {
            Image("MabelIcon")
                .renderingMode(.original)
                .resizable()
                .scaledToFill()
                .frame(width: MabelSpacing.mabelIconSize, height: MabelSpacing.mabelIconSize)
                .clipShape(Circle())
            MabelWordmark(height: MabelSpacing.wordmarkHeight)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Mabel")
    }
}

#Preview {
    MabelWordmarkLockup()
        .padding()
        .background(Color.mabelBackground)
}
