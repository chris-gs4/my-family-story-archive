import SwiftUI

struct ProgressBar: View {
    let progress: Double // 0.0 to 1.0
    var height: CGFloat = 8
    var backgroundColor: Color = .mabelSurface
    var fillColor: Color = .mabelTeal

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(backgroundColor)
                    .frame(height: height)

                Capsule()
                    .fill(fillColor)
                    .frame(width: max(0, geometry.size.width * CGFloat(progress)), height: height)
                    .animation(.easeInOut(duration: 0.3), value: progress)
            }
        }
        .frame(height: height)
    }
}

#Preview {
    VStack(spacing: 16) {
        ProgressBar(progress: 0.3)
        ProgressBar(progress: 0.7, fillColor: .mabelGold)
        ProgressBar(progress: 1.0)
    }
    .padding()
}
