// Single-image stereogram generator (SIRDS / textured autostereogram).
//
// The whole trick: each pixel copies the pixel `sep` px to its left, where
// `sep = period - depth * maxShift`. Near surfaces repeat at a shorter
// period, and the brain reads that period difference as depth.
//
// Almost everything is drawn from continuous random parameter spaces —
// shape family, placement, repeat period, palette strategy, pattern style
// and its densities — so no two images ever repeat.
//
// The hidden shape comes from two pools, and nothing in either is a fixed
// hard-coded figure: an emoji-glyph library (see ./glyphs.ts) for
// recognisable objects, and procedural families whose parameters are drawn
// fresh on every call. A shape baked into constants would show up
// identically image after image, which is exactly what makes a generator
// feel small.

import { buildGlyphDepth, findGlyph, type Glyph } from "./glyphs.ts";

export type PatternMode = "dots" | "texture";

type RGB = [number, number, number];

interface Shape {
  label: string;
  fn: (x: number, y: number) => number;
}

export interface StereogramResult {
  image: ImageData;
  answer: ImageData;
  label: string;
  mode: PatternMode;
}

/* ---------------- procedural depth maps ----------------
   Shape families drawn from continuous parameter spaces — every instance
   is one of a kind. */

// 2–5 gaussian bumps merged into an organic blob
function makeBlob(): Shape {
  const n = 2 + ((Math.random() * 4) | 0);
  const bumps = Array.from({ length: n }, () => ({
    x: 0.3 + Math.random() * 0.4,
    y: 0.32 + Math.random() * 0.36,
    r: 0.09 + Math.random() * 0.13,
    h: 0.55 + Math.random() * 0.45,
  }));
  return {
    label: "blob",
    fn: (x, y) => {
      let v = 0;
      for (const b of bumps) {
        const d2 = ((x - b.x) ** 2 + (y - b.y) ** 2) / (b.r * b.r);
        if (d2 < 9) v += b.h * Math.exp(-d2);
      }
      return v > 1 ? 1 : v;
    },
  };
}

// superformula outline with a domed interior — flowers, gears, polygons
function makeBloom(): Shape {
  const m = 2 * (2 + ((Math.random() * 5) | 0)); // even m keeps r(θ) seamless
  const n1 = 0.35 + Math.random() * 2.6;
  const n2 = 0.3 + Math.random() * 1.6;
  const n3 = 0.3 + Math.random() * 1.6;
  const N = 512;
  const lut = new Float32Array(N + 1);
  let max = 0;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2;
    const r = Math.pow(
      Math.pow(Math.abs(Math.cos((m * th) / 4)), n2) +
        Math.pow(Math.abs(Math.sin((m * th) / 4)), n3),
      -1 / n1
    );
    lut[i] = isFinite(r) ? r : 0;
    if (lut[i] > max) max = lut[i];
  }
  const k = max > 0 ? 0.34 / max : 0;
  return {
    label: "bloom",
    fn: (x, y) => {
      const dx = x - 0.5,
        dy = y - 0.5;
      const r = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx) + Math.PI;
      const edge = k * lut[((th / (Math.PI * 2)) * N) | 0];
      if (edge <= 0 || r >= edge) return 0;
      return Math.min(1, Math.pow(1 - r / edge, 0.55) * 1.15);
    },
  };
}

// two octaves of value noise inside a radial mask — rolling terrain
function makeHills(): Shape {
  const g1 = 3 + ((Math.random() * 3) | 0);
  const g2 = g1 * 2;
  const grid = (n: number) =>
    Float32Array.from({ length: (n + 1) * (n + 1) }, () => Math.random());
  const a = grid(g1),
    b = grid(g2);
  const val = (gr: Float32Array, n: number, x: number, y: number) => {
    const gx = Math.min(x * n, n - 1e-6),
      gy = Math.min(y * n, n - 1e-6);
    const x0 = gx | 0,
      y0 = gy | 0;
    const fx = gx - x0,
      fy = gy - y0;
    const sx = fx * fx * (3 - 2 * fx),
      sy = fy * fy * (3 - 2 * fy);
    const i = y0 * (n + 1) + x0;
    const top = gr[i] + (gr[i + 1] - gr[i]) * sx;
    const bot = gr[i + n + 1] + (gr[i + n + 2] - gr[i + n + 1]) * sx;
    return top + (bot - top) * sy;
  };
  return {
    label: "hills",
    fn: (x, y) => {
      if (x < 0 || x > 1 || y < 0 || y > 1) return 0;
      const n = 0.68 * val(a, g1, x, y) + 0.32 * val(b, g2, x, y);
      const dx = x - 0.5,
        dy = y - 0.5;
      const mask = Math.max(0, 1 - (dx * dx + dy * dy) / 0.23);
      return Math.min(1, n * mask * 1.5);
    },
  };
}

const procedural: Record<string, () => Shape> = {
  blob: makeBlob,
  bloom: makeBloom,
  hills: makeHills,
};

function randomShape(): Shape {
  const keys = Object.keys(procedural);
  return procedural[keys[(Math.random() * keys.length) | 0]]();
}

/* ---------------- placement ----------------
   Every shape gets a random position, scale, a tilt where the shape isn't
   rotationally symmetric, and sometimes a second shape shares the scene. */

interface Placement {
  s: number;
  cx: number;
  cy: number;
  cos: number;
  sin: number;
}

// rough half-width of each shape in its own 0..1 space, for keeping the
// placement inside the frame
const EXTENT: Record<string, number> = {
  blob: 0.45,
  bloom: 0.36,
  hills: 0.5,
};
const MAX_SCALE: Record<string, number> = { hills: 1.0, blob: 1.1 };
const MAX_ROT: Record<string, number> = { bloom: Math.PI };

function place(
  label: string,
  minS: number,
  maxS: number,
  xRange?: [number, number]
): Placement {
  const s =
    minS + Math.random() * (Math.min(MAX_SCALE[label] ?? maxS, maxS) - minS);
  const ext = Math.min(0.48, (EXTENT[label] ?? 0.4) * s + 0.02);
  let cx: number;
  if (xRange) {
    const lo = Math.max(ext, xRange[0]);
    const hi = Math.min(1 - ext, xRange[1]);
    cx = hi > lo ? lo + Math.random() * (hi - lo) : (lo + hi) / 2;
  } else {
    cx = ext + Math.random() * (1 - 2 * ext);
  }
  const cy = ext + Math.random() * (1 - 2 * ext);
  const rot = (MAX_ROT[label] ?? 0) * (Math.random() * 2 - 1);
  return { s, cx, cy, cos: Math.cos(rot), sin: Math.sin(rot) };
}

function sampleAt(
  fn: (x: number, y: number) => number,
  p: Placement,
  X: number,
  Y: number
): number {
  const dx = X - p.cx,
    dy = Y - p.cy;
  return fn(
    0.5 + (dx * p.cos + dy * p.sin) / p.s,
    0.5 + (dy * p.cos - dx * p.sin) / p.s
  );
}

function buildDepth(
  W: number,
  H: number
): { depth: Float32Array; label: string; layers: number } {
  // ?shape=<label>[,<label>] pins the hidden shape(s) — handy for testing
  // and sharing
  const names = (new URLSearchParams(location.search).get("shape") ?? "")
    .split(",")
    .filter(Boolean);

  // Glyphs carry everything a formula can't invent — a fish, a rocket, a
  // t-rex — so most images come from there; the procedural families stay as
  // the abstract, purely-relief counterpoint.
  const forcedGlyphs = names.map(findGlyph).filter((g): g is Glyph => !!g);
  if (names.length ? forcedGlyphs.length > 0 : Math.random() < 0.72) {
    const g = buildGlyphDepth(W, H, forcedGlyphs);
    if (g) return g;
  }

  const forced = names.map((l) => procedural[l]?.()).filter(Boolean) as Shape[];
  const shape = forced[0] ?? randomShape();

  // occasionally hide two smaller shapes side by side
  let twin: Shape | null = forced[1] ?? null;
  if (!twin && Math.random() < 0.25) {
    for (let tries = 0; tries < 8 && !twin; tries++) {
      const s = randomShape();
      if (s.label !== shape.label) twin = s;
    }
  }
  // a twin is pushed onto its own plane so the pair reads as two distances
  // rather than one flat cut-out
  const twinAmp = [0.55, 0.78, 1][(Math.random() * 3) | 0];
  const parts: Array<[(x: number, y: number) => number, Placement, number]> =
    twin
      ? [
          [shape.fn, place(shape.label, 0.45, 0.65, [0.14, 0.4]), 1],
          [twin.fn, place(twin.label, 0.45, 0.65, [0.6, 0.86]), twinAmp],
        ]
      : [[shape.fn, place(shape.label, 0.6, 1.3), 1]];

  const depth = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const X = x / W,
        Y = y / H;
      let v = 0;
      for (const [fn, p, amp] of parts)
        v = Math.max(v, amp * sampleAt(fn, p, X, Y));
      depth[y * W + x] = Math.min(1, v);
    }
  }
  return {
    depth,
    label: twin ? `${shape.label} & ${twin.label}` : shape.label,
    layers: twin && twinAmp < 1 ? 2 : 1,
  };
}

/* ---------------- color ---------------- */

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [(f(0) * 255) | 0, (f(8) * 255) | 0, (f(4) * 255) | 0];
}

// each palette follows a randomly chosen strategy, so the mood varies:
// rainbow walks, tight analogous sets, complementary pairs, pastels,
// neons, and single-hue duotone ramps
function makePalette(): RGB[] {
  const n = 5 + ((Math.random() * 3) | 0);
  const base = Math.random() * 360;
  const pal: RGB[] = [];
  const strat = Math.random();
  for (let i = 0; i < n; i++) {
    if (strat < 0.3) {
      // rainbow walk
      const h = (base + i * (30 + Math.random() * 40)) % 360;
      pal.push(hslToRgb(h, 55 + Math.random() * 35, 30 + Math.random() * 45));
    } else if (strat < 0.5) {
      // analogous
      const h = (base + (Math.random() * 70 - 35) + 360) % 360;
      pal.push(hslToRgb(h, 45 + Math.random() * 40, 25 + Math.random() * 45));
    } else if (strat < 0.65) {
      // complementary
      const h = (base + (Math.random() < 0.5 ? 0 : 180) + (Math.random() * 30 - 15) + 360) % 360;
      pal.push(hslToRgb(h, 50 + Math.random() * 40, 30 + Math.random() * 40));
    } else if (strat < 0.8) {
      // pastel
      pal.push(
        hslToRgb(Math.random() * 360, 25 + Math.random() * 20, 65 + Math.random() * 20)
      );
    } else if (strat < 0.9) {
      // neon
      const h = (base + i * 60 + Math.random() * 25) % 360;
      pal.push(hslToRgb(h, 85 + Math.random() * 15, 50 + Math.random() * 12));
    } else {
      // duotone ramp
      const h = (base + Math.random() * 16 - 8 + 360) % 360;
      pal.push(hslToRgb(h, 40 + Math.random() * 30, 14 + i * (52 / n) + Math.random() * 8));
    }
  }
  return pal;
}

/* ---------------- pattern strips ----------------
   The first `period` columns seed the image; everything to the right copies
   from them. A strip must wrap horizontally at `period` so the repeats join
   seamlessly; drawn elements are stamped three times (x, x±period), and
   per-pixel fields are built periodic in x. */

function css([r, g, b]: RGB): string {
  return `rgb(${r},${g},${b})`;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

// random dots, at a random grain size (1 = classic SIRDS noise, 2–3 = chunky)
function makeDotStrip(P: number, H: number, pal: RGB[]): Uint8ClampedArray {
  const g = [1, 1, 1, 2, 2, 3][(Math.random() * 6) | 0];
  const data = new Uint8ClampedArray(P * H * 4);
  for (let y = 0; y < H; y += g) {
    for (let x = 0; x < P; x += g) {
      const c = pal[(Math.random() * pal.length) | 0];
      const nz = (Math.random() * 40 - 20) | 0;
      const r = clamp(c[0] + nz),
        gg = clamp(c[1] + nz),
        b = clamp(c[2] + nz);
      for (let dy = 0; dy < g && y + dy < H; dy++) {
        for (let dx = 0; dx < g && x + dx < P; dx++) {
          const i = ((y + dy) * P + x + dx) * 4;
          data[i] = r;
          data[i + 1] = gg;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
    }
  }
  return data;
}

function makeTextureStrip(P: number, H: number, pal: RGB[]): Uint8ClampedArray {
  const tile = document.createElement("canvas");
  tile.width = P;
  tile.height = H;
  const t = tile.getContext("2d")!;

  // ?style=<name> pins the pattern style, the same way ?shape= pins the
  // hidden figure — handy for eyeballing one style at a time
  const styles = ["confetti", "blobs", "shards", "waves", "mosaic", "stripes"];
  const forced = new URLSearchParams(location.search).get("style");
  const style =
    forced && styles.includes(forced)
      ? forced
      : styles[(Math.random() * styles.length) | 0];

  t.fillStyle = css(pal[0]);
  t.fillRect(0, 0, P, H);

  const wrapped = (draw: () => void) => {
    for (const off of [-P, 0, P]) {
      t.save();
      t.translate(off, 0);
      draw();
      t.restore();
    }
  };

  if (style === "confetti") {
    const count = H * (2 + Math.random() * 3.5);
    const rBase = 1.5 + Math.random() * 3;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * P,
        y = Math.random() * H;
      const r = rBase * (0.5 + Math.random());
      t.fillStyle = css(pal[1 + ((Math.random() * (pal.length - 1)) | 0)]);
      wrapped(() => {
        t.beginPath();
        t.arc(x, y, r, 0, Math.PI * 2);
        t.fill();
      });
    }
  } else if (style === "blobs") {
    const count = H / (2.2 + Math.random() * 2.5);
    const rMax = 14 + Math.random() * 20;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * P,
        y = Math.random() * H;
      const r = 6 + Math.random() * rMax;
      const c = pal[1 + ((Math.random() * (pal.length - 1)) | 0)];
      wrapped(() => {
        const g = t.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, css(c));
        g.addColorStop(1, "rgba(0,0,0,0)");
        t.fillStyle = g;
        t.beginPath();
        t.arc(x, y, r, 0, Math.PI * 2);
        t.fill();
      });
    }
  } else if (style === "shards") {
    const count = H / (1.5 + Math.random() * 1.5);
    const sMax = 8 + Math.random() * 14;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * P,
        y = Math.random() * H;
      const s = 4 + Math.random() * sMax;
      const a = Math.random() * Math.PI * 2;
      t.fillStyle = css(pal[1 + ((Math.random() * (pal.length - 1)) | 0)]);
      wrapped(() => {
        t.beginPath();
        for (let k = 0; k < 3; k++) {
          const th = a + (k * Math.PI * 2) / 3;
          const px = x + Math.cos(th) * s,
            py = y + Math.sin(th) * s;
          if (k) {
            t.lineTo(px, py);
          } else {
            t.moveTo(px, py);
          }
        }
        t.fill();
      });
    }
  } else if (style === "waves") {
    // periodic per-pixel field, tileable by construction
    const img = t.createImageData(P, H);
    const d = img.data;
    // integer wave counts keep the tile seamless, and coprime ones keep the
    // sum from repeating at some fraction of the period
    const k1 = 2 + ((Math.random() * 3) | 0);
    let k2 = 3 + ((Math.random() * 4) | 0);
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    while (gcd(k1, k2) !== 1) k2++;
    const fy1 = 0.02 + Math.random() * 0.05;
    const fy2 = 0.01 + Math.random() * 0.04;
    // A smooth field alone is the weakest tile there is: every crest looks
    // like every other crest, so no patch is identifiable and the eye has
    // nothing to pair. Nudging the colour by a per-cell amount keeps the wave
    // shape while giving each part of it an identity.
    const jc = 14 + ((Math.random() * 11) | 0);
    const jh = 9 + Math.random() * 8;
    const jrows = Math.ceil(H / jh);
    const jit = Uint8Array.from({ length: jc * jrows }, () =>
      Math.random() < 0.5 ? 0 : 1 + ((Math.random() * 2) | 0)
    );
    for (let y = 0; y < H; y++) {
      const jr = Math.min(jrows - 1, (y / jh) | 0);
      for (let x = 0; x < P; x++) {
        const u = (x / P) * Math.PI * 2;
        const v =
          Math.sin(u * k1 + y * fy1) * 0.5 +
          Math.sin(u * k2 - y * fy2 + Math.sin(y * 0.02) * 2) * 0.5;
        const base = Math.min(
          pal.length - 1,
          Math.max(0, ((v * 0.5 + 0.5) * pal.length) | 0)
        );
        const jx = Math.min(jc - 1, ((x / P) * jc) | 0);
        const c = pal[(base + jit[jr * jc + jx]) % pal.length];
        const i = (y * P + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    }
    t.putImageData(img, 0, 0);
  } else if (style === "mosaic") {
    // grid of colored cells; column count divides the period so it wraps
    // Cell counts matter more than they look. A period holding only a
    // handful of independent cells is a nearly featureless tile: patches
    // inside it are interchangeable, so the eye pairs the wrong ones and the
    // image will not resolve however long you stare. The dot and confetti
    // styles carry hundreds of independent elements per period — these
    // counts bring the grid into the same league.
    const cols = 10 + ((Math.random() * 15) | 0);
    const ch = 7 + Math.random() * 11;
    const rows = Math.ceil(H / ch);
    const cells: RGB[] = [];
    for (let i = 0; i < cols * rows; i++)
      cells.push(pal[(Math.random() * pal.length) | 0]);
    const img = t.createImageData(P, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const ri = Math.min(rows - 1, (y / ch) | 0);
      for (let x = 0; x < P; x++) {
        const ci = Math.min(cols - 1, ((x / P) * cols) | 0);
        const c = cells[ri * cols + ci];
        const i = (y * P + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    }
    t.putImageData(img, 0, 0);
  } else {
    // stripes: diagonal colour bands, periodic in x by construction. Each
    // band draws its own colour — sweeping the palette straight through
    // would make the strip repeat inside its own width, which hands the eye
    // a second, shorter rhythm and ruins the image (see selfSimilarity).
    const k = 9 + ((Math.random() * 10) | 0);
    // Colour per (band, vertical segment). A band running one flat colour the
    // whole way down is the worst thing a stereogram tile can contain: every
    // patch inside it looks like every other, so the eye matches it against
    // the wrong neighbour — and against one a few rows off, too. Breaking the
    // band into segments gives each patch something of its own.
    const segH = 9 + ((Math.random() * 14) | 0);
    const nseg = Math.ceil(H / segH);
    const cell: RGB[] = [];
    for (let b = 0; b < k; b++) {
      for (let g = 0; g < nseg; g++) {
        let c = pal[(Math.random() * pal.length) | 0];
        const prev = g ? cell[b * nseg + g - 1] : null;
        for (let tries = 0; tries < 4 && c === prev; tries++)
          c = pal[(Math.random() * pal.length) | 0];
        cell.push(c);
      }
    }
    const slope = (Math.random() * 2 - 1) * 0.03 * k;
    const img = t.createImageData(P, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < P; x++) {
        const f = (((x / P) * k + y * slope) % k + k) % k;
        const c = cell[(f | 0) * nseg + Math.min(nseg - 1, (y / segH) | 0)];
        const i = (y * P + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    }
    t.putImageData(img, 0, 0);
  }

  const data = t.getImageData(0, 0, P, H).data;

  // Brightness noise in 2x2 blocks, not per pixel. Per-pixel grain averages
  // itself away in the eye and leaves smooth banded styles ambiguous: a patch
  // then matches its neighbour sideways *and* sideways-and-down, so vergence
  // has a whole family of candidate pairings and never locks. A block is
  // coarse enough to survive that averaging, which gives every patch its own
  // fingerprint. It costs the wrong matches only — the right one is an exact
  // copy of the strip, so it stays perfect however loud the grain gets.
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < P; x += 2) {
      const n = (Math.random() * 48 - 24) | 0;
      for (let dy = 0; dy < 2 && y + dy < H; dy++) {
        for (let dx = 0; dx < 2 && x + dx < P; dx++) {
          const i = ((y + dy) * P + x + dx) * 4;
          data[i] = clamp(data[i] + n);
          data[i + 1] = clamp(data[i + 1] + n);
          data[i + 2] = clamp(data[i + 2] + n);
        }
      }
    }
  }
  return data;
}

/* ---------------- strip sanity ----------------
   A strip must not repeat inside its own width. If it does — five identical
   bands across one period, say — the finished image carries a second, much
   shorter rhythm on top of the real one, and the eye locks onto that
   instead. The depth then cannot be read no matter how long the viewer
   stares, because the shorter rhythm is the same everywhere: it says
   "flat wall" over the whole frame and drowns out the shape.

   Detecting it is cheap. Compare every column against the column `s` to its
   right, for every shift, on a row-averaged copy (the averaging also erases
   the fine per-pixel noise, which would otherwise hide the bands). If some
   shift comes back near zero while the rest do not, that shift is a false
   period. */

function selfSimilarity(
  strip: Uint8ClampedArray,
  P: number,
  H: number
): number {
  const R = 24;
  const band = Math.max(1, Math.floor(H / R));
  const col = new Float32Array(P * R);
  for (let c = 0; c < P; c++) {
    for (let r = 0; r < R; r++) {
      let sum = 0;
      for (let y = r * band; y < (r + 1) * band; y++) {
        const i = (y * P + c) * 4;
        sum += 0.299 * strip[i] + 0.587 * strip[i + 1] + 0.114 * strip[i + 2];
      }
      col[c * R + r] = sum / band;
    }
  }
  // shifts below 8 px are skipped: dot grain and cell edges make those
  // legitimately similar without ever reading as a rhythm
  const diffs: number[] = [];
  for (let sh = 8; sh <= P - 8; sh++) {
    let d = 0;
    for (let c = 0; c < P; c++) {
      const a = c * R,
        b = ((c + sh) % P) * R;
      for (let r = 0; r < R; r++) d += Math.abs(col[a + r] - col[b + r]);
    }
    diffs.push(d / (P * R));
  }
  if (!diffs.length) return 1;
  diffs.sort((a, b) => a - b);
  const mid = diffs[diffs.length >> 1];
  return mid > 0 ? diffs[0] / mid : 1; // 1 = clean, near 0 = false period
}

// A washed-out strip is the other way an image becomes unreadable: pale
// pastels on a smooth texture leave the eye nothing to match on, so it never
// finds the pairing at all. Stretch the strip around its own mean until the
// light-dark range is workable. The same transform hits every pixel, so
// copies stay exact copies and the geometry is untouched.
const MIN_SPREAD = 28;

function ensureContrast(strip: Uint8ClampedArray, P: number, H: number) {
  const n = P * H;
  let sum = 0,
    sum2 = 0;
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const l = 0.299 * strip[j] + 0.587 * strip[j + 1] + 0.114 * strip[j + 2];
    sum += l;
    sum2 += l * l;
  }
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  if (sd >= MIN_SPREAD || sd < 1) return;
  const g = Math.min(2.6, MIN_SPREAD / sd);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    strip[j] = clamp(mean + (strip[j] - mean) * g);
    strip[j + 1] = clamp(mean + (strip[j + 1] - mean) * g);
    strip[j + 2] = clamp(mean + (strip[j + 2] - mean) * g);
  }
}

/* ---------------- colour drift ----------------
   Now and then the finished image is swept through a slowly turning hue, so
   one corner runs teal and the other coral. It is decoration only — the
   depth lives entirely in the repeat period.

   The one hard rule is that brightness must not change along x. Fusion pairs
   `pixel[x]` with `pixel[x + sep]`, and the eye matches on luminance; shift
   the brightness between those two and the pair stops matching. A hue
   rotation leaves luminance where it was, so it is free to swing as far as
   it likes. Vertically there is no rule at all, since rows never interact. */

type Drift = { axis: "x" | "y" | "radial"; from: number; span: number };

const DRIFT_CHANCE = 0.1;

function maybeDrift(): Drift | null {
  if (Math.random() >= DRIFT_CHANCE) return null;
  const axis = (["x", "y", "radial"] as const)[(Math.random() * 3) | 0];
  // across x the sweep has to stay gentle enough that one period's worth of
  // pixels barely changes hue; down y it can swing much harder
  const span =
    (axis === "y" ? 90 + Math.random() * 120 : 55 + Math.random() * 75) *
    (Math.random() < 0.5 ? -1 : 1);
  return { axis, from: Math.random() * 360, span };
}

// hue rotation in RGB, the matrix the CSS `hue-rotate` filter uses; built
// around the luminance coefficients so brightness survives the turn
function hueMatrix(deg: number): Float32Array {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a),
    s = Math.sin(a);
  return Float32Array.of(
    0.213 + 0.787 * c - 0.213 * s,
    0.715 - 0.715 * c - 0.715 * s,
    0.072 - 0.072 * c + 0.928 * s,
    0.213 - 0.213 * c + 0.143 * s,
    0.715 + 0.285 * c + 0.14 * s,
    0.072 - 0.072 * c - 0.283 * s,
    0.213 - 0.213 * c - 0.787 * s,
    0.715 - 0.715 * c + 0.715 * s,
    0.072 + 0.928 * c + 0.072 * s
  );
}

function applyDrift(d: Uint8ClampedArray, W: number, H: number, dr: Drift) {
  // 96 quantised matrices are indistinguishable from a continuous sweep and
  // turn the per-pixel cost into nine multiplies
  const STEPS = 96;
  const lut: Float32Array[] = [];
  for (let i = 0; i < STEPS; i++)
    lut.push(hueMatrix(dr.from + (dr.span * i) / (STEPS - 1)));

  const cx = W / 2,
    cy = H / 2;
  const rMax = Math.hypot(cx, cy);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t =
        dr.axis === "x"
          ? x / W
          : dr.axis === "y"
            ? y / H
            : Math.hypot(x - cx, y - cy) / rMax;
      const m = lut[Math.min(STEPS - 1, (t * STEPS) | 0)];
      const i = (y * W + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      d[i] = m[0] * r + m[1] * g + m[2] * b;
      d[i + 1] = m[3] * r + m[4] * g + m[5] * b;
      d[i + 2] = m[6] * r + m[7] * g + m[8] * b;
    }
  }
}

/* ---------------- generation ---------------- */

export function makeStereogram(
  W: number,
  H: number,
  mode: PatternMode
): StereogramResult {
  const { depth, label, layers } = buildDepth(W, H);

  // The repeat period is randomized too, so even the stripe rhythm differs
  // between images. Depth is spent out of a budget of `maxShift` px, so a
  // scene stacked on several planes needs a long period — otherwise the
  // planes land a handful of pixels apart and read as one surface.
  const lo = layers >= 3 ? 112 : 88;
  const period = lo + ((Math.random() * (136 - lo)) | 0);
  const maxShift = Math.round(period * 0.3);

  const pal = makePalette();
  const roll = () =>
    mode === "texture"
      ? makeTextureStrip(period, H, pal)
      : makeDotStrip(period, H, pal);
  let strip = roll();
  // a strip that repeats inside itself is unreadable — redraw it (which also
  // redraws the style) rather than ship an image nobody can fuse
  for (let tries = 0; tries < 4 && selfSimilarity(strip, period, H) < 0.35; tries++)
    strip = roll();
  ensureContrast(strip, period, H);

  const image = new ImageData(W, H);
  const d = image.data;

  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      const i = (row + x) * 4;
      const sep = period - Math.round(depth[row + x] * maxShift);
      if (x >= sep) {
        const j = (row + x - sep) * 4;
        d[i] = d[j];
        d[i + 1] = d[j + 1];
        d[i + 2] = d[j + 2];
      } else {
        const j = (y * period + x) * 4;
        d[i] = strip[j];
        d[i + 1] = strip[j + 1];
        d[i + 2] = strip[j + 2];
      }
      d[i + 3] = 255;
    }
  }

  const drift = maybeDrift();
  if (drift) applyDrift(d, W, H, drift);

  // answer overlay: the pattern dims behind a lit 3D relief of the depth
  // map, so every surface — smooth waves included — reads as the shape the
  // viewer was supposed to see
  const T0 = 0.03,
    T1 = 0.09; // soft silhouette ramp on the depth map
  const S = 46; // depth-to-height scale for surface normals
  // light from the upper left
  const ll = Math.hypot(-0.45, -0.55, 0.7);
  const LX = -0.45 / ll,
    LY = -0.55 / ll,
    LZ = 0.7 / ll;

  const answer = new ImageData(W, H);
  const ad = answer.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const j = i * 4;
      const t = Math.min(1, Math.max(0, (depth[i] - T0) / (T1 - T0)));
      if (t === 0) {
        // outside the shape: translucent dark veil, pattern stays visible
        ad[j] = 8;
        ad[j + 1] = 10;
        ad[j + 2] = 14;
        ad[j + 3] = 216;
        continue;
      }
      // normal from the depth gradient (clamped central differences)
      const gx =
        ((depth[i + (x < W - 1 ? 1 : 0)] - depth[i - (x > 0 ? 1 : 0)]) / 2) * S;
      const gy =
        ((depth[i + (y < H - 1 ? W : 0)] - depth[i - (y > 0 ? W : 0)]) / 2) * S;
      const nl = Math.hypot(gx, gy, 1);
      const diff = Math.max(0, (-gx * LX - gy * LY + LZ) / nl);
      // height carries the answer (closer to the viewer = paler mint), the
      // lambert term only models the slopes — like a shaded terrain map —
      // and everything feathers into the veil across the silhouette ramp
      const h = Math.min(1, depth[i]);
      const shade = 0.55 + 0.45 * diff;
      const spec = Math.pow(diff, 24) * 0.25;
      const r = (13 + 154 * h) * shade + 255 * spec;
      const g = (94 + 149 * h) * shade + 255 * spec;
      const bl = (84 + 141 * h) * shade + 255 * spec;
      ad[j] = Math.min(255, 8 * (1 - t) + r * t) | 0;
      ad[j + 1] = Math.min(255, 10 * (1 - t) + g * t) | 0;
      ad[j + 2] = Math.min(255, 14 * (1 - t) + bl * t) | 0;
      ad[j + 3] = (216 + 39 * t) | 0;
    }
  }

  return { image, answer, label, mode };
}
