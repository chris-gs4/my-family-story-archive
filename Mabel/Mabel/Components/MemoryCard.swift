import SwiftUI

struct MemoryCard: View {
    let memory: Memory
    let index: Int
    let onDelete: () -> Void
    let onRetry: () -> Void

    private var stateIcon: some View {
        Group {
            switch memory.state {
            case .processing:
                ProgressView()
                    .controlSize(.small)
                    .tint(.mabelTeal)
            case .processed:
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.mabelTeal)
                    .font(.system(size: 16))
            case .failed:
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.mabelBurgundy)
                    .font(.system(size: 16))
            case .submitted:
                Image(systemName: "clock.fill")
                    .foregroundColor(.mabelGold)
                    .font(.system(size: 16))
            case .notStarted:
                EmptyView()
            }
        }
    }

    private var title: String {
        if let prompt = memory.promptUsed, !prompt.isEmpty {
            return prompt
        }
        if memory.typedEntry != nil && memory.audioFileName == nil {
            return "Written memory"
        }
        return "Memory \(index + 1)"
    }

    private var subtitle: String {
        if memory.typedEntry != nil && memory.audioFileName == nil {
            return "Typed"
        }
        if memory.duration > 0 {
            let minutes = Int(memory.duration) / 60
            let seconds = Int(memory.duration) % 60
            return String(format: "%d:%02d", minutes, seconds)
        }
        return ""
    }

    private var previewText: String? {
        let text = memory.narrativeText ?? memory.transcript ?? memory.typedEntry
        guard let text, !text.isEmpty else { return nil }
        if text.count <= 120 { return text }
        return String(text.prefix(120)) + "..."
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            stateIcon
                .frame(width: 20)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.comfortaa(14, weight: .bold))
                    .foregroundColor(.mabelText)
                    .lineLimit(2)

                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.comfortaa(12, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                }

                if let preview = previewText {
                    Text(preview)
                        .font(.comfortaa(12, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                        .lineLimit(3)
                        .padding(.top, 2)
                }
            }

            Spacer()

            VStack(spacing: 8) {
                if memory.state == .failed {
                    Button(action: onRetry) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.mabelTeal)
                    }
                    .buttonStyle(.plain)
                }

                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(.system(size: 14))
                        .foregroundColor(.mabelSubtle)
                }
                .buttonStyle(.plain)
            }
            .padding(.top, 2)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(memory.state == .failed
                    ? Color.mabelBurgundy.opacity(0.06)
                    : Color.mabelSurface.opacity(0.95))
        )
    }
}
