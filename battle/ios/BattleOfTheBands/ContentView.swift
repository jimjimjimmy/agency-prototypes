import SwiftUI

struct ContentView: View {
    @StateObject private var band = BandModel()
    @StateObject private var music = MusicModel()
    @State private var screen: Screen = .studio

    enum Screen: String, CaseIterable { case studio = "Studio", music = "Music Maker", tour = "Tour" }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                Picker("Screen", selection: $screen) {
                    ForEach(Screen.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)

                switch screen {
                case .studio: StudioView(band: band)
                case .music: MusicView(music: music)
                case .tour: TourView(band: band)
                }
            }
            .padding(16)
        }
        .background(Color.white)
        .foregroundStyle(Color.black)
        .tint(.black)
    }

    private var header: some View {
        HStack {
            Text("Battle of the Bands").font(.title2.bold())
            Spacer()
            Text("test prototype").font(.caption).padding(4).overlay(Rectangle().stroke(Color.black, lineWidth: 2))
        }
    }
}

struct StudioView: View {
    @ObservedObject var band: BandModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField(Options.bandPlaceholder, text: $band.bandName)
                .textFieldStyle(.roundedBorder)
                .submitLabel(.done)

            HStack {
                Text("Members")
                ForEach([2, 3, 4], id: \.self) { n in
                    Button("\(n)") { band.slots = n }
                        .buttonStyle(ChipStyle(on: band.slots == n))
                }
            }

            let columns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
            LazyVGrid(columns: band.slots == 3 ? [GridItem(.flexible())] : columns, spacing: 12) {
                ForEach(0..<band.slots, id: \.self) { i in
                    MemberCard(band: band, index: i)
                }
            }

            Text("Stats").font(.headline)
            Text("Points budget 150 per member. Member Energy is stamina, not song Intensity.")
                .font(.footnote)
            ForEach(0..<band.slots, id: \.self) { i in
                StatCard(band: band, index: i)
            }

            Text("Fans \(band.fans) · Chemistry \(band.chemistry) · Unlocks \(band.unlocks.isEmpty ? "none" : band.unlocks.joined(separator: ", "))")
                .font(.footnote)
        }
    }
}

struct MemberCard: View {
    @ObservedObject var band: BandModel
    let index: Int

    var body: some View {
        let m = band.members[index]
        VStack(spacing: 6) {
            AvatarView(member: m)
                .overlay(Rectangle().stroke(Color.black, lineWidth: 3))
            TextField(Options.placeholderNames[index], text: Binding(
                get: { band.members[index].name },
                set: { band.members[index].name = $0 }
            ))
            .textFieldStyle(.roundedBorder)
            ForEach(Row.allCases, id: \.self) { row in
                HStack(spacing: 4) {
                    Text(row.label).font(.caption).frame(width: 74, alignment: .leading)
                    Button("‹") { band.cycle(member: index, row: row, by: -1) }.buttonStyle(ChipStyle(on: false))
                    Text(value(of: row, m)).font(.caption.bold()).frame(maxWidth: .infinity)
                    Button("›") { band.cycle(member: index, row: row, by: 1) }.buttonStyle(ChipStyle(on: false))
                }
            }
        }
        .padding(8)
        .overlay(Rectangle().stroke(Color.black, lineWidth: 3))
    }

    private func value(of row: Row, _ m: Member) -> String {
        switch row {
        case .role: return Options.role[m.role]
        case .hair: return Options.hair[m.hair]
        case .outfit: return Options.outfit[m.outfit]
        case .accessory: return Options.accessory[m.accessory]
        case .color: return Options.colorName[m.color]
        }
    }
}

struct StatCard: View {
    @ObservedObject var band: BandModel
    let index: Int

    var body: some View {
        let m = band.members[index]
        VStack(alignment: .leading, spacing: 4) {
            Text("\(m.name.isEmpty ? Options.placeholderNames[index] : m.name) · points left \(Member.budgetLeft(m))")
                .font(.subheadline.bold())
            ForEach(Stat.allCases, id: \.self) { stat in
                HStack {
                    Text(stat.label).frame(width: 90, alignment: .leading)
                    Button("−") { band.adjust(member: index, stat: stat, by: -1) }.buttonStyle(ChipStyle(on: false))
                    Text("\(m.stats[stat] ?? 0)").frame(width: 40)
                    Button("+") { band.adjust(member: index, stat: stat, by: 1) }.buttonStyle(ChipStyle(on: false))
                }
            }
        }
        .padding(8)
        .overlay(Rectangle().stroke(Color.black, lineWidth: 3))
    }
}

extension Member {
    static func budgetLeft(_ m: Member) -> Int { BandModel.budget - m.pointsUsed }
}

struct MusicView: View {
    @ObservedObject var music: MusicModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            chips("Genre", MusicModel.genres, selected: music.genre) { music.genre = $0 }
            chips("Tempo", MusicModel.tempos, selected: music.tempo) { music.tempo = $0 }
            Text("Intensity").font(.headline)
            Text("Song intensity, not member Energy.").font(.footnote)
            chips("", MusicModel.intensities, selected: music.intensity) { music.intensity = $0 }
            Text("Role layers").font(.headline)
            HStack {
                ForEach(MusicModel.layers, id: \.self) { layer in
                    Button(layer) { music.layerOn[layer]?.toggle() }
                        .buttonStyle(ChipStyle(on: music.layerOn[layer] ?? false))
                }
            }
            Text("Audio loop not ported yet. Web prototype has the Web Audio loop.")
                .font(.footnote)
        }
    }

    private func chips(_ title: String, _ list: [String], selected: String, pick: @escaping (String) -> Void) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            if !title.isEmpty { Text(title).font(.headline) }
            HStack {
                ForEach(list, id: \.self) { v in
                    Button(v) { pick(v) }.buttonStyle(ChipStyle(on: v == selected))
                }
            }
        }
    }
}

struct TourView: View {
    @ObservedObject var band: BandModel
    @State private var at = 1               // 0 home, 1 studio, 2 tour
    @State private var worldX: CGFloat = 0  // slides opposite to travel
    @State private var facing: CGFloat = 1  // van flips when direction changes
    @State private var busy = false
    @State private var status = "At Studio. Transition takes 4.0 s."

    private let names = ["Home", "Studio", "Tour Venue"]
    private let stepX: CGFloat = 180

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack {
                Rectangle().stroke(Color.black, lineWidth: 3)
                world
                    .offset(x: worldX)
                van
            }
            .frame(height: 180)
            .clipped()

            HStack {
                ForEach(0..<3, id: \.self) { i in
                    Button(names[i]) { go(to: i) }.buttonStyle(ChipStyle(on: at == i))
                }
            }
            Text(status).font(.footnote)
        }
        .onAppear { worldX = CGFloat(1 - at) * -stepX }
    }

    private var world: some View {
        HStack(spacing: 0) {
            label("HOME").frame(width: 180)
            label("STUDIO").frame(width: 180)
            label("TOUR VENUE").frame(width: 180)
        }
        .frame(width: 540)
    }

    private func label(_ s: String) -> some View {
        VStack {
            Spacer()
            Text(s).font(.caption.bold())
                .padding(.bottom, 6)
        }
        .frame(height: 180)
    }

    private var van: some View {
        RoundedRectangle(cornerRadius: 10)
            .fill(Color.black)
            .frame(width: 80, height: 34)
            .scaleEffect(x: facing, y: 1)
            .overlay(alignment: .bottom) { Circle().fill(Color.black).frame(width: 14).offset(y: 8) }
    }

    private func go(to target: Int) {
        guard !busy, target != at else { return }
        busy = true
        let dir: CGFloat = target > at ? 1 : -1
        withAnimation(.easeInOut(duration: 0.3)) { facing = dir }
        withAnimation(.easeInOut(duration: 3.0).delay(0.6)) {
            worldX = CGFloat(1 - target) * -stepX
        }
        at = target
        status = "Moving to \(names[target]). 4.0 s."
        DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
            busy = false
            status = "At \(names[target])."
            if target == 2 {
                band.fans += 10
                if !band.unlocks.contains("Tour Venue") { band.unlocks.append("Tour Venue") }
            }
        }
    }
}

struct ChipStyle: ButtonStyle {
    let on: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.bold())
            .padding(.horizontal, 10)
            .frame(minHeight: 44)
            .foregroundStyle(on ? Color.white : Color.black)
            .background(on ? Color.black : Color.white)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.black, lineWidth: 3))
            .opacity(configuration.isPressed ? 0.8 : 1)
    }
}
