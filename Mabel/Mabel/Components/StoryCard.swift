import SwiftUI

struct StoryCard: View {
    let entry: StoryEntry
    var onReadMore: () -> Void = {}
    var onAddDetails: () -> Void = {}

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        return formatter.string(from: entry.date)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Title
            Text(entry.title)
                .font(.comfortaa(20, weight: .bold))
                .foregroundColor(.mabelText)

            // Date
            Text(formattedDate)
                .font(.comfortaa(12, weight: .light))
                .foregroundColor(.mabelSubtle)

            // Divider
            Rectangle()
                .fill(Color.mabelTeal.opacity(0.3))
                .frame(height: 1)

            // Story preview
            Text(entry.previewText)
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelText.opacity(0.85))
                .lineLimit(3)
                .lineSpacing(4)

            // Read More button
            Button(action: onReadMore) {
                Text("Read More")
                    .font(.comfortaa(14, weight: .medium))
                    .foregroundColor(.mabelTeal)
            }

            // Separator
            Rectangle()
                .fill(Color.mabelSubtle.opacity(0.2))
                .frame(height: 1)
                .padding(.vertical, 4)

            // Add Details section
            VStack(alignment: .leading, spacing: 8) {
                Text("Add characters, locations, and more details to help us draft a better story.")
                    .font(.comfortaa(12, weight: .regular))
                    .foregroundColor(.mabelSubtle)
                    .lineSpacing(2)

                Button(action: onAddDetails) {
                    Text("Add Details")
                        .font(.comfortaa(14, weight: .medium))
                        .foregroundColor(.mabelTeal)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.mabelSurface.opacity(0.95))
                .shadow(color: Color.mabelText.opacity(0.05), radius: 8, x: 0, y: 2)
        )
    }
}

#Preview {
    ScrollView {
        StoryCard(entry: StoryEntry.mockEntries[0])
            .padding()
    }
    .background(Color.mabelBackground)
}
