# Battle of the Bands, web test prototype

Test prototype, not a shipped game. Fictional names only. Placeholders: `rockrs`, `Karl`, `Miranda`, `Cate`, `Billy`.

## Run

- Phone test on home Wi-Fi: on the Mac, in this folder, `python3 -m http.server 8000`, then open `http://<Mac-IP>:8000/` on the phone.
- Public test: https://jimjimjimmy.github.io/agency-prototypes/battle/

## Files

- `index.html`: entry, three screens (Studio, Music Maker, Tour)
- `style.css`: black and white UI, one stroke weight
- `avatar.js`: SVG avatar, 5 rows (Role, Hair, Outfits, Accessories, Colors), original outfit patterns only
- `music.js`: Web Audio, 10 second loop, Genre, Tempo, Intensity, role layers. No real songs, no Spotify
- `tour.js`: van transition, 4.0 s, Home left, Studio center, Tour Venue right
- `app.js`: state, rename-safe stats, fans and unlocks

## Libraries

- GSAP 3.13.0 and DrawSVGPlugin 3.13.0, loaded from cdnjs. GSAP is free to use, per GreenSock's license. Check the license file of the exact version before any shipped build.
- Nothing else. No Lottie, Three.js, Motion, or Mo.js.

## Open, not locked (see Notion Game Logic and Ideas, Draft)

- Battle interaction (A, B, or C), genre authenticity penalty amount, chemistry scope, rest rules, win rule, color rule, poster style, tempo fixed per genre or not.
- Outfit "Stripes" and "Dots" are original placeholders. The comp outfit is not included.
