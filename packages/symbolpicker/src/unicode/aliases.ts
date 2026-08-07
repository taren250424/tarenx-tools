/**
 * Extra search keywords per character, keyed by the character itself.
 *
 * Unicode names are English-only, so a Korean user searching 각도 or 별 finds
 * nothing even when the symbol is right there. Anything a name already covers
 * is redundant — "CHECK MARK" is matched by "check" without help — so this
 * holds Korean terms plus the English words the official names miss.
 *
 * Keys must be characters some category actually contains; build-data fails on
 * a key it cannot find, so a typo or a dropped range surfaces at build time.
 * Values are lowercased for matching.
 */
export const aliases: Record<string, string[]> = {
  // ── Math ───────────────────────────────────────────────────────
  "°": ["각도", "도", "온도", "섭씨"],
  "∠": ["각도", "각"],
  "±": ["플러스마이너스", "오차", "가감", "tolerance"],
  "×": ["곱하기", "곱셈", "엑스", "multiply", "times"],
  "÷": ["나누기", "나눗셈", "divide"],
  "≠": ["같지않음", "다름"],
  "≈": ["근사", "약", "대략", "approx", "approximately"],
  "≤": ["작거나같음", "이하"],
  "≥": ["크거나같음", "이상"],
  "∞": ["무한", "무한대", "infinite"],
  "√": ["루트", "제곱근"],
  "∑": ["시그마", "합", "총합", "sigma"],
  "∏": ["파이", "곱"],
  "∫": ["적분"],
  "∴": ["따라서", "그러므로"],
  "∵": ["왜냐하면", "이유"],
  "π": ["파이", "원주율"],
  // Escaped because the Greek letter and the technical symbol are
  // indistinguishable on screen, and a literal key silently picks one of them.
  "\u03a9": ["오메가"], // GREEK CAPITAL LETTER OMEGA
  "\u2126": ["옴", "저항", "ohm", "resistance"], // OHM SIGN
  "\u03bc": ["뮤"], // GREEK SMALL LETTER MU
  "\u00b5": ["마이크로", "micro"], // MICRO SIGN
  "Δ": ["델타", "변화량", "change"],
  "℃": ["섭씨", "온도"],
  "℉": ["화씨", "온도"],
  "½": ["이분의일", "절반"],
  "¼": ["사분의일"],
  "¾": ["사분의삼"],

  // ── Arrows ─────────────────────────────────────────────────────
  "→": ["오른쪽", "화살표", "우"],
  "←": ["왼쪽", "화살표", "좌"],
  "↑": ["위", "화살표", "상"],
  "↓": ["아래", "화살표", "하"],
  "↔": ["좌우", "양방향", "화살표"],
  "⇒": ["함의", "따라서", "화살표"],
  "⇔": ["동치", "필요충분", "화살표"],
  "↻": ["새로고침", "회전", "다시", "refresh", "reload", "retry"],

  // ── Marks ──────────────────────────────────────────────────────
  "✓": ["체크", "완료", "확인", "tick", "done", "yes"],
  "✔": ["체크", "완료", "확인", "tick", "done", "yes"],
  "✗": ["엑스", "취소", "틀림", "cross", "no", "wrong"],
  "✘": ["엑스", "취소", "틀림", "cross", "no", "wrong"],
  "☑": ["체크박스", "선택됨", "완료", "checkbox", "checked"],
  "☐": ["체크박스", "빈칸", "미선택", "checkbox", "unchecked"],
  "★": ["별", "즐겨찾기", "평점", "중요", "favorite", "rating", "bookmark"],
  "☆": ["별", "즐겨찾기", "평점", "favorite", "rating", "bookmark"],
  "♥": ["하트", "사랑", "좋아요", "love", "like"],
  "♡": ["하트", "사랑", "좋아요", "love", "like"],
  "•": ["글머리", "점", "불릿", "dot", "list"],
  "†": ["칼표", "사망", "각주", "footnote"],
  "‡": ["쌍칼표", "각주", "footnote"],

  // ── Symbols ────────────────────────────────────────────────────
  "©": ["저작권", "카피라이트"],
  "®": ["등록상표", "상표", "trademark"],
  "™": ["상표", "트레이드마크", "trademark"],
  "§": ["절", "조항", "섹션", "clause"],
  "¶": ["문단", "단락", "paragraph"],
  "№": ["번호", "넘버", "number"],
  "‰": ["퍼밀", "천분율", "permille"],
  "☎": ["전화", "연락처", "call"],
  "☺": ["웃음", "미소", "스마일", "smile", "happy"],
  "♂": ["남성", "남자"],
  "♀": ["여성", "여자"],
  "♪": ["음표", "음악", "노래", "music", "song"],
  "♫": ["음표", "음악", "노래", "music", "song"],
  "☀": ["해", "태양", "맑음", "날씨", "sunny", "weather"],
  "☂": ["우산", "비", "날씨", "rain", "weather"],
  "☃": ["눈사람", "눈", "겨울", "날씨", "winter", "weather"],
  "♠": ["스페이드", "카드", "트럼프", "card", "poker"],
  "♣": ["클로버", "클럽", "카드", "card", "poker", "clover"],
  "♦": ["다이아", "다이아몬드", "카드", "card", "poker"],

  // ── Currency ───────────────────────────────────────────────────
  "₩": ["원", "원화", "한국", "돈", "money", "currency"],
  "€": ["유로", "돈", "money", "currency"],
  "£": ["파운드", "돈", "money", "currency"],
  "¥": ["엔", "위안", "돈", "money", "currency"],
  "¢": ["센트", "돈", "money", "currency"],

  // ── Punctuation ────────────────────────────────────────────────
  "…": ["말줄임표", "생략", "점점점", "dots"],
  "—": ["줄표", "대시", "긴줄"],
  "–": ["붙임표", "대시"],
  "「": ["낫표", "따옴표", "괄호", "quote"],
  "」": ["낫표", "따옴표", "괄호", "quote"],
  "『": ["겹낫표", "따옴표", "괄호", "quote"],
  "』": ["겹낫표", "따옴표", "괄호", "quote"],
  "、": ["모점", "쉼표", "comma"],
  "。": ["고리점", "마침표", "period", "full stop"],
  "〜": ["물결", "물결표", "부터", "tilde"],
  "※": ["참고", "주의", "쌀표", "note", "attention"],

  // ── Shapes ─────────────────────────────────────────────────────
  "■": ["네모", "사각형", "정사각형", "filled"],
  "□": ["네모", "사각형", "빈칸", "empty"],
  "●": ["동그라미", "원", "점", "filled", "dot"],
  "○": ["동그라미", "원", "빈칸", "empty"],
  "▲": ["세모", "삼각형", "위", "up"],
  "▼": ["세모", "삼각형", "아래", "down"],
  "◆": ["마름모", "다이아", "diamond", "rhombus"],
  "①": ["숫자", "번호", "동그라미", "number"],
};
