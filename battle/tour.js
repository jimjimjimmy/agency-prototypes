// Tour transition: van, Home (left), Studio (center), Tour Venue (right).
// Total transition is 4.0 s: optional flip 0 to 0.6 s, slide 0.6 to 3.6 s, settle 3.6 to 4.0 s.
// Reduced motion, or no GSAP, shows the final state immediately.
const POS = { home: -1, studio: 0, tour: 1 };
const STOP_X = { home: -360, studio: 0, tour: 360 };
const VAN_X = 180;
const TOTAL = 4.0;

const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = () => typeof window.gsap !== 'undefined';

export function createTour(svg, { onArrive } = {}) {
  const world = svg.querySelector('#world');
  const vanFlip = svg.querySelector('#vanFlip');
  const van = svg.querySelector('#van');
  const wheels = svg.querySelectorAll('.wheel');
  const state = { at: 'studio', facing: 1, busy: false, lastMs: null };

  const tx = (pos) => VAN_X - STOP_X[pos];

  function finish(target, t0, dir, instant) {
    state.at = target;
    state.facing = dir;
    state.busy = false;
    state.lastMs = instant ? 0 : Math.round(performance.now() - t0);
    if (onArrive) onArrive(target, state.lastMs);
  }

  function go(target) {
    if (state.busy || target === state.at) return null;
    const dir = Math.sign(POS[target] - POS[state.at]);
    const flip = dir !== state.facing;
    const t0 = performance.now();
    state.busy = true;

    if (reduced() || !hasGsap()) {
      if (hasGsap()) {
        window.gsap.set(world, { x: tx(target) });
        window.gsap.set(vanFlip, { scaleX: dir });
      }
      finish(target, t0, dir, true);
      return Promise.resolve(0);
    }

    const gsap = window.gsap;
    const from = tx(state.at);
    const to = tx(target);
    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          finish(target, t0, dir, false);
          resolve(state.lastMs);
        },
      });
      if (flip) {
        tl.to(vanFlip, { scaleX: 0, duration: 0.3, ease: 'power1.in' })
          .to(vanFlip, { scaleX: dir, duration: 0.3, ease: 'power1.out' }, '>');
      }
      tl.to(world, { x: to, duration: 3.0, ease: 'power2.inOut' }, 0.6)
        .to(wheels, { rotation: 1440 * dir, duration: 3.0, ease: 'none' }, 0.6)
        .to(van, { y: -3, duration: 0.2, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0.6)
        .to(van, { y: 0, duration: 0.4, ease: 'power1.out' }, TOTAL - 0.4);
      gsap.set(world, { x: from });
    });
  }

  if (hasGsap()) {
    window.gsap.set(world, { x: tx(state.at) });
  }

  return { go, state, total: TOTAL };
}
