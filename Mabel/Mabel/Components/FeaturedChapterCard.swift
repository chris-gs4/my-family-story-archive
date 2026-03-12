import SwiftUI

struct FeaturedChapterCard: View {
    let chapter: Chapter

    private var ctaTitle: String {
        chapter.completedMemoryCount > 0 ? "CONTINUE CHAPTER" : "START CHAPTER"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Chapter \(chapter.id) – \(chapter.title)")
                .font(.comfortaa(18, weight: .bold))
                .foregroundColor(.mabelText)

            Text("\(chapter.completedMemoryCount) of \(Chapter.memoriesPerChapter) memories recorded")
                .font(.comfortaa(13, weight: .regular))
                .foregroundColor(.mabelSubtle)

            ProgressBar(
                progress: Double(chapter.completedMemoryCount) / Double(Chapter.memoriesPerChapter),
                height: 6
            )
            .padding(.bottom, 4)

            // CTA label (non-interactive — NavigationLink handles tap)
            Text(ctaTitle)
                .font(.comfortaa(16, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Capsule().fill(Color.mabelTeal))
                .overlay(
                    Capsule()
                        .strokeBorder(Color.mabelTeal.opacity(0.8), lineWidth: 3)
                )
                .shadow(color: .mabelTeal.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [.white, Color.mabelTeal.opacity(0.05)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(Color.mabelTeal.opacity(0.3), lineWidth: 3)
        )
        .shadow(color: .mabelTeal.opacity(0.25), radius: 12, x: 0, y: 8)
    }
}

// MARK: - Featured Card Button Style

struct FeaturedCardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .shadow(
                color: .mabelTeal.opacity(configuration.isPressed ? 0.35 : 0),
                radius: configuration.isPressed ? 16 : 0,
                x: 0,
                y: configuration.isPressed ? 10 : 0
            )
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

#Preview {
    FeaturedChapterCard(chapter: Chapter.allChapters[0])
        .padding()
}
