// Runs regex matching off the main thread so catastrophic-backtracking
// patterns can be killed by terminating the worker instead of freezing the UI.

export interface MatchGroup {
  index: number;
  name: string | null;
  text: string | null;
  range: [number, number] | null;
}

export interface MatchResult {
  start: number;
  end: number;
  text: string;
  groups: MatchGroup[];
}

export interface WorkerRequest {
  id: number;
  source: string;
  flags: string;
  text: string;
  replacement?: string;
}

export interface WorkerResponse {
  id: number;
  matches?: MatchResult[];
  truncated?: boolean;
  replaced?: string;
  error?: string;
}

const MATCH_LIMIT = 5000;
const TEXT_PREVIEW_LIMIT = 200;

function preview(s: string): string {
  return s.length > TEXT_PREVIEW_LIMIT ? s.slice(0, TEXT_PREVIEW_LIMIT) + "…" : s;
}

function toResult(m: RegExpExecArray): MatchResult {
  const indices = (m as RegExpExecArray & { indices?: RegExpIndicesArray })
    .indices;
  // Per spec, indices.groups[name] is the SAME array object as indices[i],
  // so reference equality recovers each numbered group's name.
  const nameByRange = new Map<[number, number], string>();
  if (indices?.groups) {
    for (const [name, range] of Object.entries(indices.groups)) {
      if (range) nameByRange.set(range, name);
    }
  }
  const groups: MatchGroup[] = [];
  for (let i = 1; i < m.length; i++) {
    const range = indices?.[i] ?? null;
    groups.push({
      index: i,
      name: range ? (nameByRange.get(range) ?? null) : null,
      text: m[i] === undefined ? null : preview(m[i]),
      range: range ? [range[0], range[1]] : null,
    });
  }
  return {
    start: m.index,
    end: m.index + m[0].length,
    text: preview(m[0]),
    groups,
  };
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, source, flags, text, replacement } = e.data;
  let re: RegExp;
  try {
    // Validate with the user's own flags first so error messages don't
    // mention the d flag we add internally for group indices.
    new RegExp(source, flags);
    re = new RegExp(source, flags.includes("d") ? flags : flags + "d");
  } catch (err) {
    postMessage({ id, error: (err as Error).message } satisfies WorkerResponse);
    return;
  }

  const matches: MatchResult[] = [];
  let truncated = false;
  if (!re.global && !re.sticky) {
    const m = re.exec(text);
    if (m) matches.push(toResult(m));
  } else {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (matches.length >= MATCH_LIMIT) {
        truncated = true;
        break;
      }
      matches.push(toResult(m));
      if (m[0] === "") {
        // Zero-length match: advance manually (by code point) or loop forever.
        const cp = text.codePointAt(re.lastIndex);
        re.lastIndex += cp !== undefined && cp > 0xffff ? 2 : 1;
        if (re.lastIndex > text.length) break;
      }
    }
  }

  let replaced: string | undefined;
  if (typeof replacement === "string") {
    // Fresh regex: the exec loop above left lastIndex mid-string.
    replaced = text.replace(new RegExp(source, flags), replacement);
  }

  postMessage({ id, matches, truncated, replaced } satisfies WorkerResponse);
};
