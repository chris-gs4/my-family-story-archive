import SwiftUI

struct ChapterCard: View {
    let chapter: Chapter

    private var statusIcon: String {
        if chapter.isApproved {
            return "checkmark.circle.fill"
        } else if chapter.isReadyForReview {
            return "circle.fill"
        } else if chapter.completedMemoryCount > 0 {
            return "circle.lefthalf.filled"
        } else {
            return "circle"
        }
    }

    private var statusColor: Color {
        if chapter.isApproved {
            return .mabelTeal
        } else if chapter.isReadyForReview {
            return .orange
        } else if chapter.completedMemoryCount > 0 {
            return .mabelGold
        } else {
            return .mabelSubtle.opacity(0.4)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Ch. \(chapter.id)")
                    .font(.comfortaa(12, weight: .medium))
                    .foregroundColor(.mabelSubtle)

                Spacer()

                Image(systemName: statusIcon)
                    .font(.system(size: 16))
                    .foregroundColor(statusColor)
            }

            Text(chapter.title)
                .font(.comfortaa(15, weight: .bold))
                .foregroundColor(.mabelText)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            if chapter.isApproved {
                Text("Approved")
                    .font(.comfortaa(11, weight: .medium))
                    .foregroundColor(.mabelTeal)
            } else if chapter.isReadyForReview {
                Text("Ready for review")
                    .font(.comfortaa(11, weight: .medium))
                    .foregroundColor(.orange)
            } else if chapter.completedMemoryCount > 0 {
                Text("\(chapter.completedMemoryCount)/5")
                    .font(.comfortaa(11, weight: .regular))
                    .foregroundColor(.mabelSubtle)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.mabelSurface.opacity(0.95))
        )
    }
}

#Preview {
    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        ChapterCard(chapter: Chapter.allChapters[0])
        ChapterCard(chapter: Chapter.allChapters[1])
    }
    .padding()
}
