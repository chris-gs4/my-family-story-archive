import SwiftUI

struct ProgressCard: View {
    let chapters: [Chapter]
    let currentChapterID: Int?

    private var completedCount: Int {
        chapters.filter { $0.isCompleted }.count
    }

    private var totalCount: Int {
        Chapter.totalChapters
    }

    private var percentage: Int {
        guard totalCount > 0 else { return 0 }
        return Int(Double(completedCount) / Double(totalCount) * 100)
    }

    private func circleState(for chapter: Chapter) -> ChapterCircleState {
        if chapter.isCompleted {
            return .completed
        } else if chapter.id == currentChapterID {
            return .active
        } else {
            return .incomplete
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                Text("YOUR STORY")
                    .font(.comfortaa(14, weight: .bold))
                    .foregroundColor(.mabelText)
                    .tracking(1)

                Text("Your unique life journey")
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelSubtle)
            }

            // Progress text + percentage badge
            HStack {
                Text("Chapters Complete: \(completedCount) of \(totalCount)")
                    .font(.comfortaa(16, weight: .semiBold))
                    .foregroundColor(.mabelText)

                Spacer()

                Text("\(percentage)%")
                    .font(.comfortaa(14, weight: .semiBold))
                    .foregroundColor(.mabelTeal)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color.mabelMintBadge)
                    )
            }

            // Chapter circles
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(chapters) { chapter in
                        ChapterCircleIndicator(
                            chapterNumber: chapter.id,
                            state: circleState(for: chapter)
                        )
                    }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.mabelSurface)
        )
        .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
    }
}

#Preview {
    let chapters = Chapter.allChapters
    ProgressCard(chapters: chapters, currentChapterID: 1)
        .padding(24)
        .background(Color.mabelWarmBg)
}
