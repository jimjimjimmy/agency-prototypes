import SwiftUI

// Same state rules as battle/app.js (web test prototype).
// Renaming, cosmetics and band size never touch stats, fans, chemistry or unlocks.

enum Options {
    static let role = ["Vocals", "Guitar", "Bass", "Keys", "Drums", "DJ"]
    static let hair = ["Short", "Long", "Spiky"]
    static let outfit = ["Tee", "Stripes", "Dots", "Jacket"]
    static let accessory = ["None", "Sunglasses", "Headphones", "Beanie"]
    static let colorName = ["Red", "Yellow", "Green", "Sky", "Pink", "Violet"]
    static let colors: [Color] = [
        Color(red: 1.00, green: 0.23, blue: 0.19),
        Color(red: 1.00, green: 0.84, blue: 0.04),
        Color(red: 0.20, green: 0.78, blue: 0.35),
        Color(red: 0.35, green: 0.78, blue: 0.98),
        Color(red: 1.00, green: 0.18, blue: 0.57),
        Color(red: 0.69, green: 0.32, blue: 0.87),
    ]
    // Placeholders only. A player can name a band or a member anything.
    static let placeholderNames = ["Karl", "Miranda", "Cate", "Billy"]
    static let bandPlaceholder = "rockrs"
}

enum Row: CaseIterable {
    case role, hair, outfit, accessory, color

    var label: String {
        switch self {
        case .role: return "Role"
        case .hair: return "Hair"
        case .outfit: return "Outfits"
        case .accessory: return "Accessories"
        case .color: return "Colors"
        }
    }

    var count: Int {
        switch self {
        case .role: return Options.role.count
        case .hair: return Options.hair.count
        case .outfit: return Options.outfit.count
        case .accessory: return Options.accessory.count
        case .color: return Options.colorName.count
        }
    }
}

enum Stat: CaseIterable {
    case skill, presence, energy

    var label: String {
        switch self {
        case .skill: return "Skill"
        case .presence: return "Presence"
        case .energy: return "Energy"
        }
    }
}

struct Member {
    var name = ""
    var role: Int
    var hair = 0
    var outfit = 0
    var accessory = 0
    var color: Int
    var stats: [Stat: Int] = [.skill: 30, .presence: 30, .energy: 30]

    var pointsUsed: Int { stats.values.reduce(0, +) }

    func index(for row: Row) -> Int {
        switch row {
        case .role: return role
        case .hair: return hair
        case .outfit: return outfit
        case .accessory: return accessory
        case .color: return color
        }
    }

    mutating func set(_ row: Row, to value: Int) {
        switch row {
        case .role: role = value
        case .hair: hair = value
        case .outfit: outfit = value
        case .accessory: accessory = value
        case .color: color = value
        }
    }
}

final class BandModel: ObservableObject {
    static let budget = 150
    static let statStep = 5
    static let statMax = 100

    @Published var bandName = ""
    @Published var slots = 4
    @Published var members: [Member] = (0..<4).map { Member(role: $0 % 6, color: $0 % 6) }
    @Published var fans = 0
    @Published var chemistry = 0
    @Published var unlocks: [String] = []

    func cycle(member i: Int, row: Row, by delta: Int) {
        let count = row.count
        let next = (members[i].index(for: row) + delta + count) % count
        members[i].set(row, to: next)
    }

    func adjust(member i: Int, stat: Stat, by delta: Int) {
        let step = delta * Self.statStep
        let current = members[i].stats[stat] ?? 0
        let next = current + step
        guard next >= 0, next <= Self.statMax else { return }
        if step > 0, members[i].pointsUsed + step > Self.budget { return }
        members[i].stats[stat] = next
    }
}

// Music Maker knobs, same names as the web prototype. Audio loop is not ported yet.
final class MusicModel: ObservableObject {
    static let genres = ["Rock", "Indie Pop", "Grunge", "Metal", "Country", "Folk"]
    static let tempos = ["Slow", "Medium", "Fast"]
    static let intensities = ["Low", "Medium", "High"]
    static let layers = ["Drums", "Bass", "Chords", "Lead"]

    @Published var genre = "Rock"
    @Published var tempo = "Medium"
    @Published var intensity = "Medium"
    @Published var layerOn: [String: Bool] = ["Drums": true, "Bass": true, "Chords": true, "Lead": true]
}
