// Avatar master style: bold black solid fills with white line detail.
// One stroke width (SW) everywhere. Member color is the background only.
// No grey, no gradient, no shading, no thin lines.
const INK = '#000';
const PAPER = '#fff';
const SW = 6;

export const HAIR = ['Short', 'Long', 'Spiky'];
export const OUTFIT = ['Tee', 'Stripes', 'Dots', 'Jacket'];
export const ACCESSORY = ['None', 'Sunglasses', 'Headphones', 'Beanie'];
export const ROLE = ['Vocals', 'Guitar', 'Bass', 'Keys', 'Drums', 'DJ'];
export const COLOR = ['#ff3b30', '#ffd60a', '#34c759', '#5ac8fa', '#ff2d92', '#af52de'];
export const COLOR_NAME = ['Red', 'Yellow', 'Green', 'Sky', 'Pink', 'Violet'];

let uid = 0;

// Original patterns only. Not the comp outfit.
function outfitPattern(id, outfit) {
  if (outfit === 1) {
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="${INK}"/><rect y="6" width="16" height="4" fill="${PAPER}"/></pattern>`;
  }
  if (outfit === 2) {
    return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="${INK}"/><circle cx="9" cy="9" r="3" fill="${PAPER}"/></pattern>`;
  }
  return '';
}

function hairBack(hair) {
  if (hair !== 1) return '';
  return `<path d="M56 84 Q50 26 100 26 Q150 26 144 84 L152 156 Q124 144 100 146 Q76 144 48 156 Z"
    fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
}

function hairTop(hair) {
  if (hair === 0) {
    return `<path d="M64 78 Q62 36 100 34 Q138 36 136 78 Q124 60 100 60 Q76 60 64 78 Z"
      fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  if (hair === 1) {
    return `<path d="M64 78 Q62 36 100 34 Q138 36 136 78 Q124 60 100 60 Q76 60 64 78 Z"
      fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  return `<path d="M66 72 L58 34 L82 50 L92 24 L104 48 L116 24 L124 50 L142 34 L134 72 Q100 56 66 72 Z"
    fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
}

function accessory(acc) {
  if (acc === 1) {
    return `<rect x="72" y="78" width="24" height="14" rx="4" fill="${INK}" stroke="${INK}" stroke-width="${SW}"/>
      <rect x="104" y="78" width="24" height="14" rx="4" fill="${INK}" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M96 84 H104" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M77 84 H84" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round"/>`;
  }
  if (acc === 2) {
    return `<path d="M58 84 Q56 24 100 24 Q144 24 142 84 L136 84 Q136 34 100 34 Q64 34 64 84 Z"
        fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="48" y="78" width="16" height="26" rx="6" fill="${INK}" stroke="${INK}" stroke-width="${SW}"/>
      <rect x="136" y="78" width="16" height="26" rx="6" fill="${INK}" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M54 88 V96" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round"/>`;
  }
  if (acc === 3) {
    return `<path d="M64 74 Q60 30 100 28 Q140 30 136 74 Z" fill="${INK}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="62" y="66" width="76" height="12" fill="${INK}" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M70 52 H130" stroke="${PAPER}" stroke-width="${SW}"/>`;
  }
  return '';
}

function outfitDetail(outfit) {
  if (outfit === 0) {
    return `<path d="M84 118 Q100 136 116 118" fill="none" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round"/>`;
  }
  if (outfit === 3) {
    return `<path d="M100 122 L80 186 M100 122 L120 186 M100 130 V236" fill="none" stroke="${PAPER}" stroke-width="${SW}"/>`;
  }
  return '';
}

function instrument(role) {
  const ink = `fill="${INK}" stroke="${INK}" stroke-width="${SW}"`;
  switch (ROLE[role]) {
    case 'Vocals':
      return `<circle cx="164" cy="164" r="10" ${ink}/>
        <path d="M160 170 L146 210" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
        <path d="M161 160 L163 163" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round"/>`;
    case 'Guitar':
      return `<path d="M160 196 L192 140" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
        <circle cx="150" cy="208" r="20" ${ink}/>
        <circle cx="150" cy="208" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="${SW}"/>`;
    case 'Bass':
      return `<path d="M160 196 L198 124" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
        <circle cx="150" cy="208" r="20" ${ink}/>
        <path d="M136 208 H164" stroke="${PAPER}" stroke-width="${SW}"/>`;
    case 'Keys':
      return `<rect x="124" y="180" width="64" height="24" rx="3" ${ink}/>
        <path d="M136 184 V200 M148 184 V200 M160 184 V200 M172 184 V200" stroke="${PAPER}" stroke-width="${SW}"/>`;
    case 'Drums':
      return `<path d="M140 170 L156 192" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
        <ellipse cx="152" cy="206" rx="26" ry="16" ${ink}/>
        <path d="M130 204 H174" stroke="${PAPER}" stroke-width="${SW}"/>`;
    case 'DJ':
      return `<circle cx="152" cy="204" r="22" ${ink}/>
        <circle cx="152" cy="204" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="${SW}"/>`;
    default:
      return '';
  }
}

// m: { color, hair, outfit, accessory, role } as indexes. Returns an SVG string.
export function renderAvatar(m) {
  const id = `ap${++uid}`;
  const patterned = m.outfit === 1 || m.outfit === 2;
  const torsoFill = patterned ? `url(#${id})` : INK;
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Member avatar">
    <defs>${outfitPattern(id, m.outfit)}</defs>
    <rect width="200" height="240" fill="${COLOR[m.color]}"/>
    ${hairBack(m.hair)}
    <path d="M48 236 L50 150 Q52 120 100 116 Q148 120 150 150 L152 236 Z"
      fill="${torsoFill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${outfitDetail(m.outfit)}
    <circle cx="100" cy="82" r="36" fill="${PAPER}" stroke="${INK}" stroke-width="${SW}"/>
    ${hairTop(m.hair)}
    <circle cx="86" cy="86" r="4" fill="${INK}"/>
    <circle cx="114" cy="86" r="4" fill="${INK}"/>
    <path d="M88 102 Q100 110 112 102" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
    ${accessory(m.accessory)}
    ${instrument(m.role)}
  </svg>`;
}
