#if os(iOS)
import SwiftUI
import XCTest

@testable import Mabel

@MainActor
final class DesignConceptSnapshotTests: XCTestCase {

    private func saveSnapshot(_ view: some View, name: String, width: CGFloat = 393, height: CGFloat = 852) {
        let hostingController = UIHostingController(
            rootView: view
                .frame(width: width, height: height)
                .environment(AppState())
        )
        hostingController.view.frame = CGRect(x: 0, y: 0, width: width, height: height)
        hostingController.view.layoutIfNeeded()

        let renderer = UIGraphicsImageRenderer(bounds: hostingController.view.bounds)
        let image = renderer.image { _ in
            hostingController.view.drawHierarchy(in: hostingController.view.bounds, afterScreenUpdates: true)
        }

        let data = image.pngData()!
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("mabel_concepts")
        try! FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let url = dir.appendingPathComponent("\(name).png")
        try! data.write(to: url)
        print("Snapshot saved to: \(url.path)")
    }

    func testProfileConceptA() {
        saveSnapshot(ProfileConceptA(), name: "profile_concept_a")
    }

    func testProfileConceptB() {
        saveSnapshot(ProfileConceptB(), name: "profile_concept_b")
    }

    func testProfileConceptC() {
        saveSnapshot(ProfileConceptC(), name: "profile_concept_c")
    }
}
#endif
