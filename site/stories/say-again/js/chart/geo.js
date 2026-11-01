// geo.js: the bay as a map, for the chart and for the direction finder. Bearings in the
// story are computed from these positions, so the numbers on the radio, the lines on the
// chart and the fix always agree.
//
// Units: a 1000 x 1000 square, north up, x to the east, y to the south. 100 units are about
// one nautical mile. West is the open sea; a long dune spit holds the station; east of it
// is the lagoon, and on its far shore the town.

export const STATIONS = {
  dune: { name: 'Dune Radio', short: 'DUNE', x: 245, y: 640 },
  cape: { name: 'Cape Radio', short: 'CAPE', x: 710, y: 235 },
  pilot: { name: 'Pilot station', short: 'PILOT', x: 520, y: 885 },
};

// Where transmissions come from. Only the chart knows; the story never shows these points.
export const TARGETS = {
  boat: { x: 470, y: 360 },
  home: { x: 792, y: 584 },
};

// The mainland on the east and south, then the spit, as outlines (clockwise).
export const MAINLAND = [
  [1000, 0], [820, 0], [770, 110], [745, 175], [700, 215], [690, 245], [735, 280], [705, 375],
  [684, 470], [692, 548], [676, 640], [646, 760], [566, 858], [480, 888], [402, 928],
  [334, 962], [306, 1000], [1000, 1000],
];

export const SPIT = [
  [306, 1000], [287, 900], [276, 760], [268, 640], [262, 500], [250, 360], [233, 220],
  [212, 110], [196, 56], [168, 64], [184, 218], [202, 360], [214, 500], [222, 640],
  [230, 780], [244, 900], [252, 1000],
];

// The town on the east shore: its streets (polylines) with their names, and the blocks of
// houses between them. Only drawn when the chart zooms in.
export const TOWN = {
  name: 'Eastport',
  box: { x: 690, y: 500, w: 190, h: 170 },
  streets: [
    { name: 'Harbour St', pts: [[694, 548], [880, 540]] },
    { name: 'Pine St', pts: [[700, 594], [880, 584]] },
    { name: 'Sea St', pts: [[690, 630], [880, 622]] },
    { name: 'Dune Rd', pts: [[760, 505], [770, 668]] },
    { name: 'Lime St', pts: [[835, 505], [842, 668]] },
  ],
  // House footprints [x, y, w, h]; the fifth is the one at TARGETS.home.
  houses: [
    [712, 556, 14, 10], [732, 558, 16, 11], [778, 556, 14, 10], [800, 554, 12, 10],
    [785, 575, 13, 10], [804, 594, 14, 10], [812, 572, 11, 10], [850, 566, 15, 10],
    [714, 598, 15, 11], [736, 599, 13, 10], [784, 604, 15, 11], [852, 600, 14, 10],
    [712, 636, 14, 10], [790, 634, 15, 10], [852, 628, 13, 10], [732, 520, 14, 11],
    [790, 518, 15, 10], [852, 520, 13, 10],
  ],
};

/** The bearing from one point to another, in degrees from north, clockwise. */
export function bearing(from, to) {
  const deg = (Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** The point where two bearing lines cross, or null if they are parallel. */
export function cross(a, brgA, b, brgB) {
  const da = dir(brgA);
  const db = dir(brgB);
  const det = da.x * -db.y - da.y * -db.x;
  if (Math.abs(det) < 1e-9) return null;
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const t = (tx * -db.y - ty * -db.x) / det;
  return { x: a.x + da.x * t, y: a.y + da.y * t };
}

/** A unit vector pointing along a bearing. */
export function dir(brg) {
  const r = (brg * Math.PI) / 180;
  return { x: Math.sin(r), y: -Math.cos(r) };
}

/** A bearing as the radio shows it: three digits and a degree sign. */
export function fmtBearing(brg) {
  return String(Math.round(brg) % 360).padStart(3, '0') + '°';
}
