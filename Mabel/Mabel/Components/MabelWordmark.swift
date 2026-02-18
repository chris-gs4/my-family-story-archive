import SwiftUI

struct MabelWordmark: View {
    var height: CGFloat = 32

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
