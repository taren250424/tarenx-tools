import Papa from 'papaparse';

export interface DecodeResult {
	text: string;
	encoding: string;
}

const countReplacementChars = (s: string) => {
	let n = 0;
	for (let i = 0; i < s.length; i++) {
		if (s.charCodeAt(i) === 0xfffd) n++;
	}
	return n;
};

// 'auto' tries UTF-8 first and falls back to EUC-KR (superset of CP949 in
// TextDecoder) when replacement characters show up — Korean statistical
// portals still export CP949 CSVs.
export function decodeBuffer(buffer: ArrayBuffer, encoding: string): DecodeResult {
	if (encoding !== 'auto') {
		return { text: new TextDecoder(encoding).decode(buffer), encoding };
	}
	const utf8 = new TextDecoder('utf-8').decode(buffer);
	const utf8Bad = countReplacementChars(utf8);
	if (utf8Bad === 0) return { text: utf8, encoding: 'utf-8' };
	const euckr = new TextDecoder('euc-kr').decode(buffer);
	if (countReplacementChars(euckr) < utf8Bad) return { text: euckr, encoding: 'euc-kr' };
	return { text: utf8, encoding: 'utf-8' };
}

// Delimiter is auto-detected by PapaParse (handles comma, tab, semicolon…),
// which makes Excel clipboard pastes (TSV) work unchanged.
export function parseCsv(text: string): string[][] {
	const withoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
	const result = Papa.parse<string[]>(withoutBom, {
		skipEmptyLines: true,
	});
	return result.data;
}
