import Foundation
import AVFoundation
import Observation

@Observable
class AudioRecorderService: NSObject {
    var isRecording = false
    var isPaused = false
    var elapsedSeconds: Int = 0
    var hasPermission = false

    private var audioRecorder: AVAudioRecorder?
    private var timer: Timer?
    private var currentFileURL: URL?

    override init() {
        super.init()
        checkPermission()
    }

    // MARK: - Permission

    func checkPermission() {
        if #available(iOS 17.0, *) {
            switch AVAudioApplication.shared.recordPermission {
            case .granted:
                hasPermission = true
            case .denied:
                hasPermission = false
            case .undetermined:
                hasPermission = false
            @unknown default:
                hasPermission = false
            }
        } else {
            switch AVAudioSession.sharedInstance().recordPermission {
            case .granted:
                hasPermission = true
            case .denied:
                hasPermission = false
            case .undetermined:
                hasPermission = false
            @unknown default:
                hasPermission = false
            }
        }
    }

    func requestPermission() async -> Bool {
        return await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                DispatchQueue.main.async {
                    self.hasPermission = granted
                    continuation.resume(returning: granted)
                }
            }
        }
    }

    // MARK: - Recording

    func startRecording() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
            return
        }

        let fileName = "memory_\(UUID().uuidString).m4a"
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsPath.appendingPathComponent(fileName)
        currentFileURL = fileURL

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100.0,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: fileURL, settings: settings)
            audioRecorder?.record()
            isRecording = true
            isPaused = false
            startTimer()
        } catch {
            print("Failed to start recording: \(error)")
        }
    }

    func pauseRecording() {
        audioRecorder?.pause()
        isRecording = false
        isPaused = true
        stopTimer()
    }

    func resumeRecording() {
        audioRecorder?.record()
        isRecording = true
        isPaused = false
        startTimer()
    }

    func stopRecording() -> (url: URL, fileName: String)? {
        audioRecorder?.stop()
        isRecording = false
        isPaused = false
        stopTimer()

        let session = AVAudioSession.sharedInstance()
        try? session.setActive(false)

        guard let url = currentFileURL else { return nil }
        let fileName = url.lastPathComponent
        currentFileURL = nil
        return (url: url, fileName: fileName)
    }

    func cancelRecording() {
        audioRecorder?.stop()
        isRecording = false
        isPaused = false
        elapsedSeconds = 0
        stopTimer()

        // Delete the file
        if let url = currentFileURL {
            try? FileManager.default.removeItem(at: url)
        }
        currentFileURL = nil
    }

    func reset() {
        elapsedSeconds = 0
    }

    // MARK: - Timer

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            DispatchQueue.main.async {
                self?.elapsedSeconds += 1
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}
