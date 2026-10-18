// Tiny C# syntax highlighter with VS Code Dark+ token classes.
// Returns one array of { text, cls } tokens per source line.

const DECLARATION_KEYWORDS = new Set([
  "abstract", "as", "base", "bool", "byte", "char", "class", "const", "decimal",
  "default", "delegate", "double", "enum", "event", "false", "float", "get",
  "in", "init", "int", "interface", "internal", "is", "long", "new", "null",
  "object", "out", "override", "private", "protected", "public", "readonly",
  "record", "ref", "sealed", "set", "short", "static", "string", "struct",
  "this", "true", "typeof", "uint", "ulong", "ushort", "var", "virtual", "void",
  "volatile", "async", "nameof",
]);

const CONTROL_KEYWORDS = new Set([
  "await", "break", "case", "catch", "continue", "do", "else", "finally", "for",
  "foreach", "goto", "if", "lock", "return", "switch", "throw", "try", "using",
  "while", "yield",
]);

const TOKEN = new RegExp(
  [
    "(\\/\\/.*|\\/\\*.*?\\*\\/)", // 1 comment
    '(\\$?@?"(?:[^"\\\\]|\\\\.)*"?)', // 2 string (incl. interpolated)
    "('(?:[^'\\\\]|\\\\.)*')", // 3 char
    "(\\b0[xXbB][0-9a-fA-F_]+\\b|\\b\\d[\\d_]*(?:\\.\\d+)?[fFdDmMuUlL]?\\b)", // 4 number
    "([A-Za-z_][A-Za-z0-9_]*)", // 5 identifier
    "([()[\\]{}])", // 6 bracket
    "(\\s+)", // 7 whitespace
    "(.)", // 8 anything else
  ].join("|"),
  "g"
);

const OPEN = "([{";

function classifyIdentifier(word, before, rest) {
  if (CONTROL_KEYWORDS.has(word)) return "ctl";
  if (DECLARATION_KEYWORDS.has(word)) return "kw";
  if (/^\s*\(/.test(rest) || /^\s*<[\w\s,?]*>\s*\(/.test(rest)) return "fn";
  // Members after a dot (State.Completed, _raw.Length) read as variables.
  if (/^[A-Z]/.test(word) && !before.endsWith(".")) return "type";
  return "var";
}

export function highlightCSharp(code) {
  let depth = 0;
  return code.split("\n").map((line) => {
    const tokens = [];
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(line))) {
      const text = m[0];
      let cls = "txt";
      if (m[1]) cls = "com";
      else if (m[2] || m[3]) cls = "str";
      else if (m[4]) cls = "num";
      else if (m[5]) cls = classifyIdentifier(text, line.slice(0, m.index), line.slice(TOKEN.lastIndex));
      else if (m[6]) {
        if (OPEN.includes(text)) {
          cls = `br${depth % 3}`;
          depth++;
        } else {
          depth = Math.max(0, depth - 1);
          cls = `br${depth % 3}`;
        }
      }
      tokens.push({ text, cls });
    }
    return tokens;
  });
}
