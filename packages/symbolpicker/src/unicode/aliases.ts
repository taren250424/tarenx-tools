/**
 * Extra search keywords per character, keyed by the character itself.
 *
 * Unicode names identify a character, they do not describe it: MULTIPLICATION
 * SIGN does not contain "multiply" and nothing in the name of ∠ says 각도. This
 * fills that gap for symbols; emoji get the same treatment from CLDR, which
 * build-data merges in first.
 *
 * Terms are listed in full, in Korean and English, even when the Unicode name
 * already covers them — "degree" on ° is spelled out here despite DEGREE SIGN.
 * build-data's prune() drops whatever the name already reaches, so redundant
 * entries cost nothing in the payload, and writing them out beats deciding
 * case by case which ones the name happens to catch. That judgement is what
 * previously left √ unreachable by "sqrt" and ⇒ by "implies".
 *
 * Keys must be characters some category actually contains; build-data fails on
 * a key it cannot find, so a typo or a dropped range surfaces at build time.
 * Characters with an identical-looking twin in the picker are written as \u
 * escapes, since a literal key silently picks one of them.
 */
export const aliases: Record<string, string[]> = {
  // ── Math ───────────────────────────────────────────────────────
  "°": ["각도", "도", "온도", "섭씨", "degree", "temperature"],
  "∠": ["각도", "각", "angle"],
  "±": ["플러스마이너스", "오차", "가감", "plus minus", "tolerance", "margin"],
  "×": ["곱하기", "곱셈", "엑스", "multiply", "times", "multiplication", "cross"],
  "÷": ["나누기", "나눗셈", "divide", "division"],
  "≠": ["같지않음", "다름", "not equal", "unequal", "inequality"],
  "≈": ["근사", "약", "대략", "approx", "approximately", "almost equal", "similar"],
  "≤": ["작거나같음", "이하", "less than or equal", "lte", "at most"],
  "≥": ["크거나같음", "이상", "greater than or equal", "gte", "at least"],
  "∞": ["무한", "무한대", "infinity", "infinite", "endless"],
  "√": ["루트", "제곱근", "sqrt", "square root", "radical"],
  "∑": ["시그마", "합", "총합", "sum", "sigma", "summation", "total"],
  "∏": ["파이", "곱", "product", "pi", "multiply"],
  "∫": ["적분", "integral", "integrate", "calculus"],
  "∴": ["따라서", "그러므로", "therefore", "hence", "thus"],
  "∵": ["왜냐하면", "이유", "because", "since", "reason"],
  "π": ["파이", "원주율", "pi", "circle constant"],
  // Escaped because the Greek letter and the technical symbol are
  // indistinguishable on screen, and a literal key silently picks one of them.
  "\u03a9": ["오메가", "omega", "greek"], // GREEK CAPITAL LETTER OMEGA
  "\u2126": ["옴", "저항", "ohm", "resistance", "electricity"], // OHM SIGN
  "\u03bc": ["뮤", "mu", "greek"], // GREEK SMALL LETTER MU
  "\u00b5": ["마이크로", "micro", "mu", "prefix"], // MICRO SIGN
  "Δ": ["델타", "변화량", "delta", "change", "difference"],
  "℃": ["섭씨", "온도", "celsius", "centigrade", "temperature", "degree"],
  "℉": ["화씨", "온도", "fahrenheit", "temperature", "degree"],
  "½": ["이분의일", "절반", "half", "one half", "fraction"],
  "¼": ["사분의일", "quarter", "one quarter", "fraction"],
  "¾": ["사분의삼", "three quarters", "fraction"],

  // ── Arrows ─────────────────────────────────────────────────────
  "→": ["오른쪽", "화살표", "우", "right", "arrow", "next", "forward"],
  "←": ["왼쪽", "화살표", "좌", "left", "arrow", "back", "previous"],
  "↑": ["위", "화살표", "상", "up", "arrow", "top"],
  "↓": ["아래", "화살표", "하", "down", "arrow", "bottom"],
  "↔": ["좌우", "양방향", "화살표", "bidirectional", "both", "arrow"],
  "⇒": ["함의", "따라서", "화살표", "implies", "then", "arrow"],
  "⇔": ["동치", "필요충분", "화살표", "equivalent", "iff", "if and only if"],
  "↻": ["새로고침", "회전", "다시", "refresh", "reload", "retry", "rotate", "clockwise"],

  // ── Marks ──────────────────────────────────────────────────────
  "✓": ["체크", "완료", "확인", "check", "tick", "done", "yes", "correct"],
  "✔": ["체크", "완료", "확인", "check", "tick", "done", "yes", "correct"],
  "✗": ["엑스", "취소", "틀림", "cross", "no", "wrong", "incorrect", "cancel"],
  "✘": ["엑스", "취소", "틀림", "cross", "no", "wrong", "incorrect", "cancel"],
  "☑": ["체크박스", "선택됨", "완료", "checkbox", "checked", "ballot", "selected"],
  "☐": ["체크박스", "빈칸", "미선택", "checkbox", "unchecked", "ballot", "empty"],
  "★": ["별", "즐겨찾기", "평점", "중요", "star", "favorite", "rating", "bookmark", "filled"],
  "☆": ["별", "즐겨찾기", "평점", "star", "favorite", "rating", "bookmark", "empty", "outline"],
  "♥": ["하트", "사랑", "좋아요", "heart", "love", "like", "filled"],
  "♡": ["하트", "사랑", "좋아요", "heart", "love", "like", "empty", "outline"],
  "•": ["글머리", "점", "불릿", "bullet", "dot", "list", "point"],
  "†": ["칼표", "사망", "각주", "dagger", "footnote", "death"],
  "‡": ["쌍칼표", "각주", "double dagger", "footnote"],

  // ── Symbols ────────────────────────────────────────────────────
  "©": ["저작권", "카피라이트", "copyright"],
  "®": ["등록상표", "상표", "registered", "trademark"],
  "™": ["상표", "트레이드마크", "trademark", "trade mark"],
  "§": ["절", "조항", "섹션", "section", "clause", "law"],
  "¶": ["문단", "단락", "paragraph", "pilcrow"],
  "№": ["번호", "넘버", "numero", "number"],
  "‰": ["퍼밀", "천분율", "per mille", "permille", "thousand"],
  "☎": ["전화", "연락처", "telephone", "phone", "call"],
  "☺": ["웃음", "미소", "스마일", "smile", "happy", "face", "smiley"],
  "♂": ["남성", "남자", "male", "man", "gender", "mars"],
  "♀": ["여성", "여자", "female", "woman", "gender", "venus"],
  "♪": ["음표", "음악", "노래", "music", "note", "song"],
  "♫": ["음표", "음악", "노래", "music", "note", "song"],
  "☀": ["해", "태양", "맑음", "날씨", "sun", "sunny", "weather", "clear"],
  "☂": ["우산", "비", "날씨", "umbrella", "rain", "weather"],
  "☃": ["눈사람", "눈", "겨울", "날씨", "snowman", "snow", "winter", "weather"],
  "♠": ["스페이드", "카드", "트럼프", "spade", "card", "poker", "suit"],
  "♣": ["클로버", "클럽", "카드", "club", "clover", "card", "poker", "suit"],
  "♦": ["다이아", "다이아몬드", "카드", "diamond", "card", "poker", "suit"],

  // ── Currency ───────────────────────────────────────────────────
  "₩": ["원", "원화", "한국", "돈", "won", "korea", "korean", "money", "currency"],
  "€": ["유로", "돈", "euro", "money", "currency"],
  "£": ["파운드", "돈", "pound", "sterling", "money", "currency"],
  "¥": ["엔", "위안", "돈", "yen", "yuan", "money", "currency"],
  "¢": ["센트", "돈", "cent", "money", "currency"],

  // ── Punctuation ────────────────────────────────────────────────
  "…": ["말줄임표", "생략", "점점점", "ellipsis", "dots", "omission"],
  "—": ["줄표", "대시", "긴줄", "em dash", "dash", "long dash"],
  "–": ["붙임표", "대시", "en dash", "dash"],
  "「": ["낫표", "따옴표", "괄호", "corner bracket", "quote", "bracket", "japanese"],
  "」": ["낫표", "따옴표", "괄호", "corner bracket", "quote", "bracket", "japanese"],
  "『": ["겹낫표", "따옴표", "괄호", "corner bracket", "quote", "bracket"],
  "』": ["겹낫표", "따옴표", "괄호", "corner bracket", "quote", "bracket"],
  "、": ["모점", "쉼표", "comma", "ideographic comma"],
  "。": ["고리점", "마침표", "period", "full stop", "ideographic"],
  "〜": ["물결", "물결표", "부터", "wave dash", "tilde", "wave", "range"],
  "※": ["참고", "주의", "쌀표", "reference mark", "note", "attention", "asterisk"],

  // ── Shapes ─────────────────────────────────────────────────────
  "■": ["네모", "사각형", "정사각형", "square", "filled", "black", "box"],
  "□": ["네모", "사각형", "빈칸", "square", "empty", "white", "box"],
  "●": ["동그라미", "원", "점", "circle", "filled", "black", "dot"],
  "○": ["동그라미", "원", "빈칸", "circle", "empty", "white", "ring"],
  "▲": ["세모", "삼각형", "위", "triangle", "up", "filled"],
  "▼": ["세모", "삼각형", "아래", "triangle", "down", "filled"],
  "◆": ["마름모", "다이아", "diamond", "rhombus", "filled"],
  "①": ["숫자", "번호", "동그라미", "circled", "number", "digit", "one"],
};
