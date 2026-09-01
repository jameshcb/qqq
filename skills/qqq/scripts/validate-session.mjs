#!/usr/bin/env node
// 核 sessions 归档最后一个「## HH:MM ·」section 里的两行固定表态（格式定义在 SKILL §4）：
//   帮助/FAQ: 有 <文件路径>（<编号>）      或  帮助/FAQ: 无（<一句理由>）
//   qqq 版本: X.Y.Z                          或  qqq 版本: X.Y.Z（落后，marketplace=Y.Y.Y，缺:<一句>）
//                                            或  qqq 版本: 未知（<原因>）   ← version-check 的 runningVersion 为 null（开发态直跑仓库）时
// 为什么要机械核：1.4.0 / 1.5.0 只要求「回报里说」，说没说无从核 —— 2026-09-01 James 拍「表态落盘可验」。
//
// 用法: node validate-session.mjs <session 文件路径>        （preview 模式不跑）
// 宽容面（只放这些，其余一字不差）：行首可带 `- ` / `* ` 列表符或 `**` 加粗；冒号、括号、逗号可用全角。
// section 标题的时间部分放宽为 HH:MM、HH:Mx、HH:MM–HH:MM（实际归档常写时间段或 x 掩码）——
// 不放宽会选到更早的 section，造成假通过。section 到下一个一级/二级标题为止（### 子标题属于本 section）。
// 退出码: 0 = 两行都在且合法；1 = 缺项或格式错（逐条列在 errors）；2 = 参数 / 读文件错。

import fs from "node:fs";
import path from "node:path";

const SECTION_HEADING = /^## \d{2}:[0-9x]{2}(?:[–—-]\d{2}:[0-9x]{2})?\s*·/u;
const TOP_HEADING = /^#{1,2} /u;
const ITEM = String.raw`[^\s(（、,，;；]+[(（][^()（）]+[)）]`;
const HELP_ANY = /^帮助\/FAQ[:：]/u;
const HELP_YES = new RegExp(`^帮助\\/FAQ[:：] ?有 ${ITEM}(?:\\s*[、,，;；]\\s*${ITEM})*\\s*$`, "u");
const HELP_NO = /^帮助\/FAQ[:：] ?无[(（][^()（）]+[)）]\s*$/u;
const SEMVER = String.raw`\d+\.\d+\.\d+`;
const VERSION_ANY = /^qqq 版本[:：]/u;
const VERSION_OK = new RegExp(
  `^qqq 版本[:：] ?(?:${SEMVER}|${SEMVER}[(（]落后[,，] ?marketplace=${SEMVER}[,，] ?缺[:：] ?[^()（）]+[)）]|未知[(（][^()（）]+[)）])\\s*$`,
  "u",
);

const HELP_SPEC = "帮助/FAQ: 有 <文件路径>（<编号>）  或  帮助/FAQ: 无（<一句理由>）";
const VERSION_SPEC = "qqq 版本: X.Y.Z  或  qqq 版本: X.Y.Z（落后，marketplace=Y.Y.Y，缺:<一句>）  或  qqq 版本: 未知（<原因>）";

function normalizeLine(raw) {
  const unlisted = raw.trim().replace(/^[-*]\s+/u, "");
  const unbolded = unlisted.replace(/^\*\*(.*?)\*\*$/u, "$1");
  return unbolded.trim();
}

function lastTimedSection(lines) {
  const start = lines.reduce((found, line, index) => (SECTION_HEADING.test(line) ? index : found), -1);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => TOP_HEADING.test(line));
  return { heading: lines[start], line: start + 1, body: end === -1 ? rest : rest.slice(0, end) };
}

function checkLine(body, { any, isOk, label, spec }) {
  const candidates = body.map(normalizeLine).filter((line) => any.test(line));
  if (candidates.length === 0) return { errors: [`missing line 「${label}」— expected: ${spec}`], matched: null };
  const bad = candidates.filter((line) => !isOk(line));
  if (bad.length > 0) {
    return { errors: bad.map((line) => `malformed 「${label}」 line: ${line}\n    expected: ${spec}`), matched: null };
  }
  return { errors: [], matched: candidates[candidates.length - 1] };
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: validate-session.mjs <session-file>");
  process.exit(2);
}

let text;
try {
  text = fs.readFileSync(file, "utf8");
} catch (error) {
  console.error(`Cannot read ${file}: ${error.message}`);
  process.exit(2);
}

const lines = text.replace(/\r\n/g, "\n").split("\n");
const section = lastTimedSection(lines);

if (!section) {
  console.log(
    JSON.stringify(
      { file: path.resolve(file), valid: false, section: null, errors: ["no `## HH:MM ·` section found"] },
      null,
      2,
    ),
  );
  process.exit(1);
}

const help = checkLine(section.body, {
  any: HELP_ANY,
  isOk: (line) => HELP_YES.test(line) || HELP_NO.test(line),
  label: "帮助/FAQ",
  spec: HELP_SPEC,
});
const version = checkLine(section.body, {
  any: VERSION_ANY,
  isOk: (line) => VERSION_OK.test(line),
  label: "qqq 版本",
  spec: VERSION_SPEC,
});

const errors = [...help.errors, ...version.errors];
const result = {
  file: path.resolve(file),
  valid: errors.length === 0,
  section: section.heading,
  sectionLine: section.line,
  help: help.matched,
  version: version.matched,
  errors,
};

console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
