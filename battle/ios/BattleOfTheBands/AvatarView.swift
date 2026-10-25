import SwiftUI

// Avatar master style: bold black fills, white line detail, one stroke width.
// Member color is the background only. Mirrors battle/avatar.js in simplified form.
struct AvatarView: View {
    let member: Member

    private let ink = Color.black
    private let paper = Color.white
    private let stroke: CGFloat = 6

    var body: some View {
        Canvas { ctx, size in
            let s = size.width / 200
            func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x * s, y: y * s) }
            func rect(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> CGRect {
                CGRect(x: x * s, y: y * s, width: w * s, height: h * s)
            }

            // Background: member color only.
            ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Options.colors[member.color]))

            // Long hair behind head.
            if member.hair == 1 {
                var back = Path()
                back.addRoundedRect(in: rect(50, 26, 100, 120), cornerSize: CGSize(width: 40 * s, height: 40 * s))
                ctx.fill(back, with: .color(ink))
            }

            // Torso.
            var torso = Path()
            torso.move(to: p(48, 236))
            torso.addLine(to: p(50, 150))
            torso.addQuadCurve(to: p(100, 116), control: p(52, 120))
            torso.addQuadCurve(to: p(150, 150), control: p(148, 120))
            torso.addLine(to: p(152, 236))
            torso.closeSubpath()
            ctx.fill(torso, with: .color(ink))
            ctx.stroke(torso, with: .color(ink), lineWidth: stroke)

            // Outfit detail, white line.
            if member.outfit == 0 {
                var collar = Path()
                collar.move(to: p(84, 118))
                collar.addQuadCurve(to: p(116, 118), control: p(100, 136))
                ctx.stroke(collar, with: .color(paper), lineWidth: stroke)
            } else if member.outfit == 3 {
                var zip = Path()
                zip.move(to: p(100, 122)); zip.addLine(to: p(80, 186))
                zip.move(to: p(100, 122)); zip.addLine(to: p(120, 186))
                zip.move(to: p(100, 130)); zip.addLine(to: p(100, 236))
                ctx.stroke(zip, with: .color(paper), lineWidth: stroke)
            }

            // Head.
            let head = Path(ellipseIn: rect(64, 46, 72, 72))
            ctx.fill(head, with: .color(paper))
            ctx.stroke(head, with: .color(ink), lineWidth: stroke)

            // Short or spiky hair on top.
            var top = Path()
            if member.hair == 2 {
                top.move(to: p(66, 72)); top.addLine(to: p(58, 34)); top.addLine(to: p(82, 50))
                top.addLine(to: p(92, 24)); top.addLine(to: p(104, 48)); top.addLine(to: p(116, 24))
                top.addLine(to: p(124, 50)); top.addLine(to: p(142, 34)); top.addLine(to: p(134, 72))
                top.addQuadCurve(to: p(66, 72), control: p(100, 56))
            } else {
                top.move(to: p(64, 78))
                top.addQuadCurve(to: p(136, 78), control: p(100, 26))
                top.addQuadCurve(to: p(64, 78), control: p(100, 60))
            }
            ctx.fill(top, with: .color(ink))
            ctx.stroke(top, with: .color(ink), lineWidth: stroke)

            // Face.
            ctx.fill(Path(ellipseIn: rect(82, 82, 8, 8)), with: .color(ink))
            ctx.fill(Path(ellipseIn: rect(110, 82, 8, 8)), with: .color(ink))
            var mouth = Path()
            mouth.move(to: p(88, 102))
            mouth.addQuadCurve(to: p(112, 102), control: p(100, 110))
            ctx.stroke(mouth, with: .color(ink), style: StrokeStyle(lineWidth: stroke, lineCap: .round))

            // Sunglasses.
            if member.accessory == 1 {
                ctx.fill(Path(roundedRect: rect(72, 78, 24, 14), cornerRadius: 4 * s), with: .color(ink))
                ctx.fill(Path(roundedRect: rect(104, 78, 24, 14), cornerRadius: 4 * s), with: .color(ink))
            }

            // Instrument for the role, at lower right.
            let roleName = Options.role[member.role]
            switch roleName {
            case "Guitar", "Bass":
                var neck = Path()
                neck.move(to: p(160, 196)); neck.addLine(to: p(roleName == "Bass" ? 198 : 192, roleName == "Bass" ? 124 : 140))
                ctx.stroke(neck, with: .color(ink), style: StrokeStyle(lineWidth: stroke, lineCap: .round))
                ctx.fill(Path(ellipseIn: rect(130, 188, 40, 40)), with: .color(ink))
            case "Drums":
                ctx.fill(Path(ellipseIn: rect(126, 190, 52, 32)), with: .color(ink))
            case "Keys":
                ctx.fill(Path(roundedRect: rect(124, 180, 64, 24), cornerRadius: 3 * s), with: .color(ink))
            case "DJ":
                ctx.fill(Path(ellipseIn: rect(130, 182, 44, 44)), with: .color(ink))
            default:
                ctx.fill(Path(ellipseIn: rect(154, 154, 20, 20)), with: .color(ink))
            }
        }
        .aspectRatio(200.0 / 240.0, contentMode: .fit)
        .accessibilityLabel("Member avatar")
    }
}
