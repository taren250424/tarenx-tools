export function getUnicodes(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const code = start + i;
    return {
      char: String.fromCodePoint(code),
      code: "U+" + code.toString(16).toUpperCase()
    };
  });
};