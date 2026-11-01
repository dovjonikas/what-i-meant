// chart-place.js: finds a free spot for a name on the chart. Each name has a few spots it
// may take (along its street, or round a station); the first spot that touches no pencil
// line, no house, no other street and no name already placed wins. All in screen pixels.

/** True when a line segment from a to b passes through the rectangle r ({x, y, w, h}). */
export function segmentHitsRect(a, b, r) {
  // Liang-Barsky: clip the segment against the rectangle; anything left means a hit.
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const edges = [
    [-dx, a.x - r.x],
    [dx, r.x + r.w - a.x],
    [-dy, a.y - r.y],
    [dy, r.y + r.h - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Picks the first candidate box that is clear, or the one with the fewest hits.
 * candidates: [{ box, ...anything }]; avoid: { segments: [[a, b]], boxes: [r] }.
 * The winner's box is added to avoid.boxes, so later names keep off it.
 */
export function placeName(candidates, avoid, inside) {
  let best = null;
  let bestHits = Infinity;
  for (const c of candidates) {
    if (inside && !(c.box.x >= inside.x && c.box.y >= inside.y && c.box.x + c.box.w <= inside.x + inside.w && c.box.y + c.box.h <= inside.y + inside.h)) continue;
    let hits = 0;
    for (const [a, b] of avoid.segments) if (segmentHitsRect(a, b, c.box)) hits += 1;
    for (const r of avoid.boxes) if (rectsOverlap(r, c.box)) hits += 1;
    if (hits < bestHits) {
      best = c;
      bestHits = hits;
      if (!hits) break;
    }
  }
  if (best) avoid.boxes.push(best.box);
  return best;
}
