import SwiftUI

struct MascotGreetingHeader: View {
    let userName: String

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 {
            return "Good morning"
        } else if hour < 17 {
            return "Good afternoon"
        } else {
            return "Good evening"
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image("MabelMascot")
                .renderingMode(.original)
                .resizable()
                .scaledToFit()
                .frame(width: 140, height: 140)

            VStack(alignment: .leading, spacing: 8) {
                // Mabel badge
                HStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .fill(Color.mabelGold.opacity(0.2))
                            .frame(width: 28, height: 28)
                        Text("\u{1F475}")
                            .font(.system(size: 14))
                    }
                    Text("Mabel")
                        .font(.comfortaa(13, weight: .semiBold))
                        .foregroundColor(.mabelSubtle)
                }

                Text("\(greeting), \(userName)!")
                    .font(.comfortaa(28, weight: .bold))
                    .foregroundColor(.mabelText)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)

                Text("Let's capture a memory")
                    .font(.comfortaa(18, weight: .regular))
                    .foregroundColor(.mabelText)
            }
            .padding(.top, 8)

            Spacer(minLength: 0)
        }
    }
}

#Preview {
    MascotGreetingHeader(userName: "Margaret")
        .padding(24)
        .background(Color.mabelWarmBg)
}
