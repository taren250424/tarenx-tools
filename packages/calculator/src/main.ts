import "../../shared/footer/site-footer.css";
import "../../shared/ads/ad-slot.css";
import "./main.css";

const THEME_KEY = "calculator-theme";
const MAX_DIGITS = 14;
const HISTORY_LIMIT = 30;
const FLASH_MS = 120;

type Operator = "+" | "-" | "*" | "/";

const SYMBOL: Record<Operator, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

type HistoryEntry = { expression: string; result: string };

let entry = "0";
let accumulator: number | null = null;
let pendingOp: Operator | null = null;
// The displayed value is a result, so the next digit starts a fresh entry.
let overwrite = true;
let errored = false;
// A second = repeats the last operation, the way desk calculators do.
let lastOp: Operator | null = null;
let lastOperand: number | null = null;
let expressionText = "";
const history: HistoryEntry[] = [];

// The pre-paint script in index.html already resolved the theme and applied
// the class, so read it back rather than resolving it a second time here.
let isDarkMode = document.documentElement.classList.contains("dark");

// ------------------------------------------------------------- arithmetic

function apply(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
  }
}

// Rounding to 12 significant digits hides the binary-float noise that would
// otherwise show 0.1 + 0.2 as 0.30000000000000004; parseFloat then drops the
// padding zeros toPrecision adds.
function toEntry(value: number): string {
  return String(parseFloat(value.toPrecision(12)));
}

function formatDisplay(raw: string): string {
  if (raw.includes("e")) return raw;
  const [whole, fraction] = raw.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+$)/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

function digitCount(raw: string): number {
  return raw.replace(/\D/g, "").length;
}

// ------------------------------------------------------------- rendering

const displayEl = document.getElementById("display")!;
const expressionEl = document.getElementById("expression")!;
const historyEl = document.getElementById("history-list")!;

function render() {
  const text = errored ? "Cannot divide by zero" : formatDisplay(entry);
  displayEl.textContent = text;
  displayEl.classList.toggle("error", errored);
  displayEl.classList.toggle("compact", !errored && text.length > 12);
  expressionEl.textContent = expressionText;
}

function renderHistory() {
  historyEl.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "Results you calculate land here.";
    historyEl.append(empty);
    return;
  }

  for (const item of history) {
    const button = document.createElement("button");
    button.className = "history-item";

    const expression = document.createElement("span");
    expression.className = "history-expression";
    expression.textContent = item.expression;

    const result = document.createElement("span");
    result.className = "history-result";
    result.textContent = formatDisplay(item.result);

    button.append(expression, result);
    button.addEventListener("click", () => recall(item));
    historyEl.append(button);
  }
}

function recall(item: HistoryEntry) {
  errored = false;
  entry = item.result;
  accumulator = null;
  pendingOp = null;
  overwrite = true;
  expressionText = item.expression;
  render();
}

// ------------------------------------------------------------- actions

function clearAll() {
  entry = "0";
  accumulator = null;
  pendingOp = null;
  lastOp = null;
  lastOperand = null;
  overwrite = true;
  errored = false;
  expressionText = "";
  render();
}

function fail() {
  clearAll();
  errored = true;
  render();
}

function inputDigit(digit: string) {
  if (errored) clearAll();
  if (overwrite) {
    entry = digit;
    overwrite = false;
  } else if (entry === "0") {
    entry = digit;
  } else if (digitCount(entry) < MAX_DIGITS) {
    entry += digit;
  }
  render();
}

function inputDecimal() {
  if (errored) clearAll();
  if (overwrite) {
    entry = "0.";
    overwrite = false;
  } else if (!entry.includes(".")) {
    entry += ".";
  }
  render();
}

function backspace() {
  if (errored) {
    clearAll();
    return;
  }
  // The shown value is a result rather than something being typed, so there
  // is no last keystroke to take back.
  if (overwrite) return;
  entry = entry.length > 1 ? entry.slice(0, -1) : "0";
  if (entry === "-") entry = "0";
  render();
}

function negate() {
  if (errored || entry === "0") return;
  entry = entry.startsWith("-") ? entry.slice(1) : `-${entry}`;
  render();
}

function percent() {
  if (errored) return;
  // "200 + 10 %" reads as 10 percent OF 200; with no pending + or - there is
  // nothing to take a percentage of, so it is a plain division by 100.
  const base =
    (pendingOp === "+" || pendingOp === "-") && accumulator !== null
      ? accumulator
      : 1;
  entry = toEntry((Number(entry) / 100) * base);
  overwrite = false;
  render();
}

function chooseOp(op: Operator) {
  if (errored) return;

  if (pendingOp !== null && accumulator !== null && !overwrite) {
    const result = apply(accumulator, Number(entry), pendingOp);
    if (!Number.isFinite(result)) {
      fail();
      return;
    }
    accumulator = result;
    entry = toEntry(result);
  } else {
    accumulator = Number(entry);
  }

  pendingOp = op;
  overwrite = true;
  lastOp = null;
  lastOperand = null;
  expressionText = `${formatDisplay(toEntry(accumulator))} ${SYMBOL[op]}`;
  render();
}

function equals() {
  if (errored) return;

  let a: number;
  let b: number;
  let op: Operator;

  if (pendingOp !== null && accumulator !== null) {
    a = accumulator;
    b = Number(entry);
    op = pendingOp;
  } else if (lastOp !== null && lastOperand !== null) {
    a = Number(entry);
    b = lastOperand;
    op = lastOp;
  } else {
    return;
  }

  const result = apply(a, b, op);
  if (!Number.isFinite(result)) {
    fail();
    return;
  }

  expressionText = `${formatDisplay(toEntry(a))} ${SYMBOL[op]} ${formatDisplay(
    toEntry(b)
  )} =`;
  history.unshift({ expression: expressionText, result: toEntry(result) });
  if (history.length > HISTORY_LIMIT) history.pop();

  entry = toEntry(result);
  accumulator = null;
  pendingOp = null;
  lastOp = op;
  lastOperand = b;
  overwrite = true;
  render();
  renderHistory();
}

function runAction(button: HTMLButtonElement) {
  const { action, value } = button.dataset;
  switch (action) {
    case "digit":
      inputDigit(value!);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "op":
      chooseOp(value as Operator);
      break;
    case "equals":
      equals();
      break;
    case "clear":
      clearAll();
      break;
    case "backspace":
      backspace();
      break;
    case "percent":
      percent();
      break;
    case "negate":
      negate();
      break;
  }
}

// ------------------------------------------------------------- wiring

const flashTimers = new WeakMap<HTMLElement, number>();

// Light up the key a keystroke corresponds to, so typing reads as clearly as
// clicking does.
function flash(button: HTMLButtonElement) {
  clearTimeout(flashTimers.get(button));
  button.classList.add("pressed");
  flashTimers.set(
    button,
    window.setTimeout(() => button.classList.remove("pressed"), FLASH_MS)
  );
}

function main() {
  const keypad = document.querySelector<HTMLElement>(".keypad")!;
  const keys = keypad.querySelectorAll<HTMLButtonElement>("button.key");
  const clearHistoryBtn = document.getElementById("clear-history-btn")!;
  const themeToggleBtn = document.getElementById("theme-toggle-btn")!;

  const keyMap = new Map<string, HTMLButtonElement>();
  for (const key of keys) {
    for (const name of (key.dataset.keys ?? "").split(" ").filter(Boolean)) {
      keyMap.set(name, key);
    }
  }

  keypad.addEventListener("click", (event) => {
    const key = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button.key"
    );
    if (key) runAction(key);
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = keyMap.get(event.key);
    if (!key) return;
    // Also stops Enter and Space from re-firing whichever key was last
    // clicked and still holds focus.
    event.preventDefault();
    runAction(key);
    flash(key);
  });

  clearHistoryBtn.addEventListener("click", () => {
    history.length = 0;
    renderHistory();
  });

  themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  });

  render();
  renderHistory();
}

document.addEventListener("DOMContentLoaded", main);
