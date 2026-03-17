import SwiftUI

enum ChapterCircleState {
    case completed
    case active
    case incomplete
}

struct ChapterCircleIndicator: View {
    let chapterNumber: Int
    let state: ChapterCircleState

    private var size: CGFloat {
        state == .active ? 40 : 36
    }

    private var fillColor: Color {
        switch state {
        case .completed: return .mabelCopper
        case .active: return .mabelTeal
        case .incomplete: return .mabelChapterGray
        }
    }

    private var textColor: Color {
        switch state {
        case .completed, .active: return .white
        case .incomplete: return .mabelSubtle
        }
    }

    var body: some View {
        ZStack {
            if state == .active {
                Circle()
                    .strokeBorder(Color.mabelTeal.opacity(0.3), lineWidth: 2)
                    .frame(width: size + 6, height: size + 6)
            }

            Circle()
                .fill(fillColor)
                .frame(width: size, height: size)

            Text("\(chapterNumber)")
                .font(.comfortaa(14, weight: .bold))
                .foregroundColor(textColor)
        }
    }
}

#Preview {
    HStack(spacing: 8) {
        ChapterCircleIndicator(chapterNumber: 1, state: .completed)
        ChapterCircleIndicator(chapterNumber: 2, state: .completed)
        ChapterCircleIndicator(chapterNumber: 3, state: .active)
        ChapterCircleIndicator(chapterNumber: 4, state: .incomplete)
        ChapterCircleIndicator(chapterNumber: 5, state: .incomplete)
    }
    .padding()
    .background(Color.mabelWarmBg)
}
