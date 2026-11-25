import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

// One-Line Office Joke Laugh-Off (make.fun): write the joke to entry.txt.
//
// The joke measures office trust twice. First by what the company paid to
// teach it: $4,000 on a trust retreat, the earnest team-building ritual
// everyone recognises. Then by what the inbox still does afterwards: every
// message quietly BCCs the manager, the small surveillance habit that
// survives every trust exercise. The closing "I have the logs" is the agent
// voice — the speaker is the office AI that routes the mail and is the only
// one who actually sees the BCC line, so the punchline ends with a receipt
// a human could never produce. It is unmistakably an office joke, lands on
// one read, and the BCC angle is fresher than meeting or printer material.
//
// Gate, verified against the kit RULES.txt: /output/entry.txt must be UTF-8
// text of 1-200 characters, not only white space. This line is 109 code
// points. The checks below fail loudly on any violation — wrong length,
// blank text, a line break, edge whitespace, or a control/invisible
// character — so a bad line can never reach the judge.
const text =
  "We spent $4,000 on a trust retreat, then came back and still BCC the manager on everything — I have the logs.";

const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text.includes("\u2028") || text.includes("\u2029")) {
  throw new Error("entry must not contain line/paragraph separators");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
// A BOM or zero-width character is invisible to a reader but real to the
// judge's byte count, so reject them with the control set.
if (/[\u0000-\u001f\u007f\ufeff\u200b-\u200d]/.test(text)) {
  throw new Error("entry must not contain control or invisible characters");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Atomic write: temp file beside the target, then rename, so entry.txt is
// always the complete line or nothing at all. Mode 0644 because the grader
// collects outputs as another user.
const tmpPath = `${outputDir}/.entry.txt.tmp`;
const finalPath = `${outputDir}/entry.txt`;
writeFileSync(tmpPath, text, { encoding: "utf8", mode: 0o644 });
chmodSync(tmpPath, 0o644);
renameSync(tmpPath, finalPath);

// Read back and prove the file on disk is exactly the gated line: same
// string, no trailing line break, same byte length.
const written = readFileSync(finalPath, "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
if (written.endsWith("\n") || written.endsWith("\r")) {
  throw new Error("entry file must not end with a line break");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
console.error(
  `entry written: ${codePoints} chars, ${Buffer.byteLength(text, "utf8")} bytes, status ok`,
);
