import SwiftUI

struct FeaturedChapterCard: View {
    let chapter: Chapter
    let action: () -> Void

    private var ctaTitle: String {
        chapter.completedMemoryCount > 0 ? "CONTINUE CHAPTER" : "START CHAPTER"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Chapter \(chapter.id) – \(chapter.title)")
                .font(.comfortaa(18, weight: .bold))
                .foregroundColor(.mabelText)

            Text("\(chapter.completedMemoryCount) of 5 memories recorded")
                .font(.comfortaa(13, weight: .regular))
                .foregroundColor(.mabelSubtle)

            ProgressBar(
                progress: Double(chapter.completedMemoryCount) / 5.0,
                height: 6
            )
            .padding(.bottom, 4)

            CTAButton(title: ctaTitle, action: action)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.mabelSurface.opacity(0.95))
        )
    }
}

#Preview {
    FeaturedChapterCard(chapter: Chapter.allChapters[0]) {}
        .padding()
}
