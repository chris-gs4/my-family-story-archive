import SwiftUI

struct WaveformView: View {
    var isAnimating: Bool = true
    var barCount: Int = 20
    var tintColor: Color = .mabelTeal

    @State private var barHeights: [CGFloat] = []

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<barCount, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(tintColor)
                    .frame(width: 4, height: barHeight(for: index))
                    .animation(
                        isAnimating
                            ? .easeInOut(duration: Double.random(in: 0.3...0.6))
                                .repeatForever(autoreverses: true)
                                .delay(Double(index) * 0.05)
                            : .default,
                        value: barHeights.isEmpty ? 0 : barHeights[index]
                    )
            }
        }
        .frame(height: 48)
        .onAppear {
            barHeights = (0..<barCount).map { _ in CGFloat.random(in: 6...44) }
            if isAnimating {
                animateBars()
            }
        }
        .onChange(of: isAnimating) { _, newValue in
            if newValue {
                animateBars()
            } else {
                barHeights = (0..<barCount).map { _ in CGFloat(6) }
            }
        }
    }

    private func barHeight(for index: Int) -> CGFloat {
        guard !barHeights.isEmpty, index < barHeights.count else {
            return 6
        }
        return barHeights[index]
    }

    private func animateBars() {
        withAnimation {
            barHeights = (0..<barCount).map { _ in CGFloat.random(in: 6...44) }
        }
        // Continuously animate
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            if isAnimating {
                animateBars()
            }
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        WaveformView(isAnimating: true)
        WaveformView(isAnimating: false, tintColor: .mabelBurgundy)
    }
    .padding()
    .background(Color.mabelBackground)
}
