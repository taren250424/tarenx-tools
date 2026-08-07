/** Code points in an inclusive range. */
export function getUnicodes(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
