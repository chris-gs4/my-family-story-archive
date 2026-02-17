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
                .font(.comfortaa(22, weight: .bold))
                .foregroundColor(.mabelText)

            // Date pill
            Text(formattedDate)
                .font(.comfortaa(12, weight: .medium))
                .foregroundColor(.mabelSubtle)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(Color.mabelSurface)
                )

            // Divider
            Rectangle()
                .fill(Color.mabelTeal.opacity(0.3))
                .frame(height: 1)

            // Story preview
            Text(entry.previewText)
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelText.opacity(0.85))
                .lineLimit(4)
                .lineSpacing(4)

            // Read More button
            Button(action: onReadMore) {
                Text("Read More")
                    .font(.comfortaa(13, weight: .bold))
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
                        .font(.comfortaa(13, weight: .bold))
                        .foregroundColor(.mabelTeal)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                        )
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Color.mabelText.opacity(0.06), radius: 8, x: 0, y: 2)
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
