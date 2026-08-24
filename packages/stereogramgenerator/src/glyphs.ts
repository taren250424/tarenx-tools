// Emoji-glyph depth maps.
//
// An analytic formula can only ever produce the family it encodes — a
// superformula is always a flower, a sum of gaussians is always a lump — so
// jittering its parameters buys spread, never a *new kind of thing*. And a
// stereogram is read at very low resolution: the viewer recovers a
// silhouette and its gross relief, nothing more. What makes one memorable
// is recognising an object, so we borrow the largest silhouette library
// every OS already ships — the emoji font.
//
// A glyph is rasterised once, its alpha becomes a silhouette mask, and a
// distance transform inflates that mask into relief: thin parts sit on a
// plateau so they still separate from the background, thick parts dome up.

const EMOJI_FONT =
  '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

export interface Glyph {
  ch: string;
  label: string;
}

// Picked for silhouette, not for cuteness — round faces and flat discs read
// as a featureless blob once the colour is thrown away.
export const glyphs: Glyph[] = [
  // sea
  { ch: "🐟", label: "fish" },
  { ch: "🐠", label: "tropical fish" },
  { ch: "🐬", label: "dolphin" },
  { ch: "🐳", label: "whale" },
  { ch: "🦈", label: "shark" },
  { ch: "🐙", label: "octopus" },
  { ch: "🦑", label: "squid" },
  { ch: "🦐", label: "shrimp" },
  { ch: "🦀", label: "crab" },
  { ch: "🐚", label: "shell" },
  { ch: "🐢", label: "turtle" },
  { ch: "🐊", label: "crocodile" },
  { ch: "🦭", label: "seal" },
  // land
  { ch: "🦎", label: "lizard" },
  { ch: "🐍", label: "snake" },
  { ch: "🦕", label: "dinosaur" },
  { ch: "🦖", label: "t-rex" },
  { ch: "🐘", label: "elephant" },
  { ch: "🦒", label: "giraffe" },
  { ch: "🦓", label: "zebra" },
  { ch: "🐎", label: "horse" },
  { ch: "🦌", label: "deer" },
  { ch: "🐕", label: "dog" },
  { ch: "🐈", label: "cat" },
  { ch: "🐇", label: "rabbit" },
  { ch: "🐁", label: "mouse" },
  { ch: "🐿️", label: "squirrel" },
  { ch: "🦔", label: "hedgehog" },
  { ch: "🦇", label: "bat" },
  { ch: "🐪", label: "camel" },
  { ch: "🦘", label: "kangaroo" },
  // wings and legs
  { ch: "🦋", label: "butterfly" },
  { ch: "🐝", label: "bee" },
  { ch: "🐞", label: "ladybug" },
  { ch: "🐜", label: "ant" },
  { ch: "🕷️", label: "spider" },
  { ch: "🦂", label: "scorpion" },
  { ch: "🐦", label: "bird" },
  { ch: "🦅", label: "eagle" },
  { ch: "🦉", label: "owl" },
  { ch: "🦆", label: "duck" },
  { ch: "🦢", label: "swan" },
  { ch: "🐧", label: "penguin" },
  { ch: "🦩", label: "flamingo" },
  { ch: "🦜", label: "parrot" },
  { ch: "🐓", label: "rooster" },
  // growing things
  { ch: "🌵", label: "cactus" },
  { ch: "🌴", label: "palm tree" },
  { ch: "🌲", label: "pine tree" },
  { ch: "🌻", label: "sunflower" },
  { ch: "🌷", label: "tulip" },
  { ch: "🍄", label: "mushroom" },
  { ch: "🍁", label: "maple leaf" },
  { ch: "🍀", label: "clover" },
  { ch: "🌾", label: "wheat" },
  // edible
  { ch: "🍎", label: "apple" },
  { ch: "🍐", label: "pear" },
  { ch: "🍌", label: "banana" },
  { ch: "🍇", label: "grapes" },
  { ch: "🍓", label: "strawberry" },
  { ch: "🍒", label: "cherries" },
  { ch: "🌶️", label: "chili" },
  { ch: "🥕", label: "carrot" },
  { ch: "🍦", label: "ice cream" },
  { ch: "🍕", label: "pizza slice" },
  { ch: "🧁", label: "cupcake" },
  { ch: "🥨", label: "pretzel" },
  { ch: "🦴", label: "bone" },
  // things that move
  { ch: "🚀", label: "rocket" },
  { ch: "✈️", label: "plane" },
  { ch: "🚁", label: "helicopter" },
  { ch: "⛵", label: "sailboat" },
  { ch: "🚲", label: "bicycle" },
  { ch: "🚂", label: "locomotive" },
  { ch: "🛸", label: "ufo" },
  { ch: "🪁", label: "kite" },
  { ch: "🎈", label: "balloon" },
  // things you hold
  { ch: "🔑", label: "key" },
  { ch: "⚓", label: "anchor" },
  { ch: "☂️", label: "umbrella" },
  { ch: "✂️", label: "scissors" },
  { ch: "🎸", label: "guitar" },
  { ch: "🎺", label: "trumpet" },
  { ch: "🎻", label: "violin" },
  { ch: "🔔", label: "bell" },
  { ch: "💡", label: "light bulb" },
  { ch: "🕯️", label: "candle" },
  { ch: "⌛", label: "hourglass" },
  { ch: "🧭", label: "compass" },
  { ch: "🪶", label: "feather" },
  { ch: "👑", label: "crown" },
  { ch: "🎩", label: "top hat" },
  { ch: "👟", label: "sneaker" },
  { ch: "👗", label: "dress" },
  { ch: "🗝️", label: "old key" },
  // places
  { ch: "🏰", label: "castle" },
  { ch: "🗼", label: "tower" },
  { ch: "⛺", label: "tent" },
  { ch: "🏠", label: "house" },
  { ch: "🗿", label: "moai" },
  // sky
  { ch: "⭐", label: "star" },
  { ch: "🌙", label: "crescent" },
  { ch: "☁️", label: "cloud" },
  { ch: "⚡", label: "lightning" },
  { ch: "❄️", label: "snowflake" },
  { ch: "🔥", label: "flame" },
  { ch: "💧", label: "droplet" },
  { ch: "🌊", label: "wave" },
  { ch: "🪐", label: "planet" },
  { ch: "☄️", label: "comet" },
  // marks
  { ch: "❤️", label: "heart" },
  { ch: "♠️", label: "spade" },
  { ch: "♣️", label: "club" },
  { ch: "🧩", label: "puzzle piece" },
  { ch: "♟️", label: "pawn" },
];

/* ---------------- rasterising ---------------- */

const G = 384; // glyph raster size

interface Sprite {
  canvas: HTMLCanvasElement;
  x0: number;
  y0: number;
  w: number;
  h: number;
}

function scratch(w: number, h: number): CanvasRenderingContext2D {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c.getContext("2d", { willReadFrequently: true })!;
}

function rasterise(ch: string): CanvasRenderingContext2D {
  const c = scratch(G, G);
  c.font = `${Math.round(G * 0.74)}px ${EMOJI_FONT}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#fff";
  c.fillText(ch, G / 2, G / 2);
  return c;
}

// coarse 16x16 occupancy signature, enough to recognise the tofu box a font
// falls back to when it doesn't have the glyph
function signature(px: Uint8ClampedArray): string {
  const step = G / 16;
  let s = "";
  for (let by = 0; by < 16; by++) {
    for (let bx = 0; bx < 16; bx++) {
      let hit = "0";
      for (let y = 0; y < step; y += 4) {
        for (let x = 0; x < step; x += 4) {
          const i = ((by * step + y) * G + bx * step + x) * 4 + 3;
          if (px[i] > 48) {
            hit = "1";
            y = step;
            break;
          }
        }
      }
      s += hit;
    }
  }
  return s;
}

let tofu: string | null = null;
const spriteCache = new Map<string, Sprite | null>();

function sprite(ch: string): Sprite | null {
  const cached = spriteCache.get(ch);
  if (cached !== undefined) return cached;

  // U+10FFFF is permanently unassigned, so whatever it renders as *is* this
  // font's missing-glyph box — anything matching it we quietly skip
  if (tofu === null)
    tofu = signature(rasterise("\u{10FFFF}").getImageData(0, 0, G, G).data);

  const c = rasterise(ch);
  const px = c.getImageData(0, 0, G, G).data;
  let sp: Sprite | null = null;
  if (signature(px) !== tofu) {
    let x0 = G,
      y0 = G,
      x1 = -1,
      y1 = -1;
    for (let y = 0; y < G; y++) {
      for (let x = 0; x < G; x++) {
        if (px[(y * G + x) * 4 + 3] > 48) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 >= x0)
      sp = { canvas: c.canvas, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
  spriteCache.set(ch, sp);
  return sp;
}

/* ---------------- mask to relief ---------------- */

// two-pass chamfer distance transform: how far each lit pixel sits from the
// nearest background pixel
function distanceTransform(
  mask: Uint8Array,
  W: number,
  H: number
): Float32Array {
  const A = 1,
    B = Math.SQRT2;
  const d = new Float32Array(W * H);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 1e9 : 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (y > 0) {
        const u = i - W;
        if (d[u] + A < v) v = d[u] + A;
        if (x > 0 && d[u - 1] + B < v) v = d[u - 1] + B;
        if (x < W - 1 && d[u + 1] + B < v) v = d[u + 1] + B;
      }
      if (x > 0 && d[i - 1] + A < v) v = d[i - 1] + A;
      d[i] = v;
    }
  }
  for (let y = H - 1; y >= 0; y--) {
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (y < H - 1) {
        const u = i + W;
        if (d[u] + A < v) v = d[u] + A;
        if (x > 0 && d[u - 1] + B < v) v = d[u - 1] + B;
        if (x < W - 1 && d[u + 1] + B < v) v = d[u + 1] + B;
      }
      if (x < W - 1 && d[i + 1] + A < v) v = d[i + 1] + A;
      d[i] = v;
    }
  }
  return d;
}

// 3x3 box blur in place — softens the staircase along a silhouette so the
// depth edge ramps over a couple of pixels instead of snapping
function soften(d: Float32Array, W: number, H: number, passes: number) {
  const tmp = new Float32Array(d.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        tmp[i] = (d[x > 0 ? i - 1 : i] + d[i] + d[x < W - 1 ? i + 1 : i]) / 3;
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        d[i] =
          (tmp[y > 0 ? i - W : i] + tmp[i] + tmp[y < H - 1 ? i + W : i]) / 3;
      }
    }
  }
}

const PLATEAU = 0.3; // height a hair-thin limb still gets

// The relief is smooth and gets blurred anyway, so it is built at half
// resolution and scaled back up — a quarter of the distance-transform work
// for no visible difference.
const DS = 2;

let instCtx: CanvasRenderingContext2D | null = null;

function instanceCanvas(w: number, h: number): CanvasRenderingContext2D {
  if (!instCtx || instCtx.canvas.width !== w || instCtx.canvas.height !== h) {
    instCtx = scratch(w, h);
  } else {
    instCtx.setTransform(1, 0, 0, 1, 0, 0);
    instCtx.clearRect(0, 0, w, h);
  }
  return instCtx;
}

function upsample(
  src: Float32Array,
  w: number,
  h: number,
  W: number,
  H: number
): Float32Array {
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const fy = Math.min(h - 1, Math.max(0, ((y + 0.5) * h) / H - 0.5));
    const y0 = fy | 0,
      y1 = Math.min(h - 1, y0 + 1),
      ty = fy - y0;
    for (let x = 0; x < W; x++) {
      const fx = Math.min(w - 1, Math.max(0, ((x + 0.5) * w) / W - 0.5));
      const x0 = fx | 0,
        x1 = Math.min(w - 1, x0 + 1),
        tx = fx - x0;
      const a = src[y0 * w + x0],
        b = src[y0 * w + x1];
      const c = src[y1 * w + x0],
        d = src[y1 * w + x1];
      out[y * W + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

function instanceDepth(
  sp: Sprite,
  W: number,
  H: number,
  size: number,
  cx: number,
  cy: number,
  rot: number,
  flip: boolean,
  amp: number
): Float32Array {
  const c = instanceCanvas(W, H);
  const k = size / Math.max(sp.w, sp.h);
  const dw = sp.w * k,
    dh = sp.h * k;
  c.translate(cx, cy);
  c.rotate(rot);
  if (flip) c.scale(-1, 1);
  c.drawImage(sp.canvas, sp.x0, sp.y0, sp.w, sp.h, -dw / 2, -dh / 2, dw, dh);

  const px = c.getImageData(0, 0, W, H).data;
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;

  const dist = distanceTransform(mask, W, H);
  let dmax = 0;
  for (let i = 0; i < dist.length; i++) if (dist[i] > dmax) dmax = dist[i];
  const out = new Float32Array(W * H);
  if (dmax === 0) return out;

  // dome over the thickest part of the shape, but never over more than a
  // quarter of its size — a big round glyph gets a mesa, not a hemisphere.
  // The profile is a circular arc so it flattens out with zero slope; a
  // power curve leaves a visible crease where it saturates.
  const cap = Math.max(4, Math.min(dmax, size * 0.28));
  for (let i = 0; i < out.length; i++) {
    if (!mask[i]) continue;
    const u = 1 - Math.min(1, dist[i] / cap);
    out[i] = amp * (PLATEAU + (1 - PLATEAU) * Math.sqrt(1 - u * u));
  }
  return out;
}

/* ---------------- scenes ---------------- */

const pick = <T>(a: T[]): T => a[(Math.random() * a.length) | 0];

export function findGlyph(name: string): Glyph | undefined {
  return glyphs.find((g) => g.label === name || g.ch === name);
}

// Roughly one scene in eight is staged: three different objects sitting on
// three distinct depth planes rather than scattered at random depths. It is
// the classic layered Magic Eye look, and rare enough to stay a surprise.
const LAYERED_CHANCE = 0.125;
const LAYER_AMP = [0.42, 0.71, 1];

interface Cast {
  cast: Glyph[];
  layered: boolean;
}

function castGlyphs(): Cast {
  if (Math.random() < LAYERED_CHANCE) {
    const cast: Glyph[] = [];
    while (cast.length < LAYER_AMP.length) {
      const g = pick(glyphs);
      if (!cast.includes(g)) cast.push(g);
    }
    return { cast, layered: true };
  }
  const r = Math.random();
  if (r < 0.2) {
    // a school: the same creature repeated at different sizes and depths
    const g = pick(glyphs);
    return {
      cast: Array.from({ length: 2 + ((Math.random() * 3) | 0) }, () => g),
      layered: false,
    };
  }
  if (r < 0.36) {
    const a = pick(glyphs);
    let b = pick(glyphs);
    for (let i = 0; i < 8 && b === a; i++) b = pick(glyphs);
    return { cast: [a, b], layered: false };
  }
  return { cast: [pick(glyphs)], layered: false };
}

export function buildGlyphDepth(
  W: number,
  H: number,
  forced?: Glyph[]
): { depth: Float32Array; label: string; layers: number } | null {
  const picked: Cast = forced?.length
    ? { cast: forced, layered: false }
    : castGlyphs();
  const cast = picked.cast
    .map((g) => ({ g, sp: sprite(g.ch) }))
    .filter((e): e is { g: Glyph; sp: Sprite } => e.sp !== null);
  if (!cast.length) return null;
  // a glyph the font was missing would leave the staging incomplete
  const layered = picked.layered && cast.length === LAYER_AMP.length;

  const w = Math.ceil(W / DS),
    h = Math.ceil(H / DS);
  const frame = Math.min(w * 0.82, h * 0.9);
  const n = cast.length;
  const placed: Array<{ x: number; y: number; r: number }> = [];
  const small = new Float32Array(w * h);
  const bands = [0, 1, 2];
  for (let i = bands.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [bands[i], bands[j]] = [bands[j], bands[i]];
  }

  for (let k = 0; k < n; k++) {
    const { sp } = cast[k];
    // on a staged scene the nearer plane gets the bigger figure too, so size
    // and depth agree instead of fighting each other
    const size = layered
      ? frame * (0.22 + 0.09 * k + Math.random() * 0.07)
      : n === 1
        ? frame * (0.62 + Math.random() * 0.38)
        : n === 2
          ? frame * (0.4 + Math.random() * 0.18)
          : frame * (0.24 + Math.random() * 0.18);
    const half = size / 2;
    // A staged scene hands each plane its own third of the frame, otherwise
    // rejection sampling is free to clump all three into one corner. The
    // thirds are shuffled, so the near plane is not always on the same side.
    const lo = layered ? Math.max(half, (bands[k] * w) / 3) : half;
    const hi = layered
      ? Math.max(lo + 1, Math.min(w - half, ((bands[k] + 1) * w) / 3))
      : w - half;
    let cx = (lo + hi) / 2,
      cy = h / 2;
    for (let tries = 0; tries < 90; tries++) {
      cx = lo + Math.random() * (hi - lo);
      cy = half + Math.random() * Math.max(1, h - size);
      const clear = placed.every(
        (p) => Math.hypot(p.x - cx, p.y - cy) > (p.r + half) * 0.85
      );
      if (clear) break;
    }
    placed.push({ x: cx, y: cy, r: half });

    const inst = instanceDepth(
      sp,
      w,
      h,
      size,
      cx,
      cy,
      (Math.random() * 2 - 1) * 0.3,
      Math.random() < 0.5,
      layered ? LAYER_AMP[k] : n === 1 ? 1 : 0.68 + Math.random() * 0.32
    );
    for (let i = 0; i < small.length; i++)
      if (inst[i] > small[i]) small[i] = inst[i];
  }
  soften(small, w, h, 1);
  const depth = upsample(small, w, h, W, H);
  soften(depth, W, H, 1);

  const names = cast.map((e) => e.g.label);
  const label =
    n > 1 && names.every((s) => s === names[0])
      ? `${names[0]} ×${n}`
      : [...new Set(names)].join(" & ");
  return { depth, label, layers: layered ? LAYER_AMP.length : 1 };
}
