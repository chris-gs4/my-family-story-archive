import SwiftUI

struct MabelWordmark: View {
    var height: CGFloat = 28

    var body: some View {
        Image("MabelWordmark")
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
