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
                    .font(.system(size: 18))
                    .foregroundColor(statusColor)
            }

            Text(chapter.title)
                .font(.comfortaa(15, weight: .bold))
                .foregroundColor(.mabelText)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            // Status badge
            if chapter.isApproved {
                StatusBadge(text: "Approved", icon: "checkmark.circle.fill", color: .mabelTeal)
            } else if chapter.isReadyForReview {
                StatusBadge(text: "Ready for review", icon: "circle.fill", color: .orange)
            } else if chapter.completedMemoryCount > 0 {
                StatusBadge(text: "\(chapter.completedMemoryCount)/5", icon: "circle.lefthalf.filled", color: .mabelGold)
            }

            // Mini progress bar for in-progress chapters
            if chapter.completedMemoryCount > 0 && !chapter.isApproved {
                ProgressBar(
                    progress: Double(chapter.completedMemoryCount) / Double(Chapter.memoriesPerChapter),
                    height: 3
                )
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.mabelSurface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(Color.mabelTeal.opacity(0.15), lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
    }
}

// MARK: - Status Badge

private struct StatusBadge: View {
    let text: String
    let icon: String
    let color: Color

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 9))
            Text(text)
                .font(.comfortaa(11, weight: .medium))
        }
        .foregroundColor(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(color.opacity(0.15))
        )
        .overlay(
            Capsule()
                .strokeBorder(color.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Chapter Card Button Style

struct ChapterCardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .strokeBorder(
                        Color.mabelTeal.opacity(configuration.isPressed ? 0.4 : 0),
                        lineWidth: configuration.isPressed ? 3 : 0
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .shadow(
                color: configuration.isPressed ? .black.opacity(0.12) : .clear,
                radius: configuration.isPressed ? 8 : 0,
                x: 0,
                y: configuration.isPressed ? 4 : 0
            )
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

#Preview {
    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        ChapterCard(chapter: Chapter.allChapters[0])
        ChapterCard(chapter: Chapter.allChapters[1])
    }
    .padding()
}
