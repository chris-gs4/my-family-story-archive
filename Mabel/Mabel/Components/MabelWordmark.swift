import SwiftUI

struct MabelWordmark: View {
    var height: CGFloat = MabelSpacing.wordmarkHeight

    var body: some View {
        Image("MabelWordmark")
            .renderingMode(.original)
            .resizable()
            .scaledToFit()
            .frame(height: height)
    }
}

#Preview {
    MabelWordmark()
        .padding()
        .background(Color.mabelBackground)
}
