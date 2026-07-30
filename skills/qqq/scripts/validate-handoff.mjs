#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];

if (!file) {
  console.error("Usage: validate-handoff.mjs <handoff-file>");
  process.exit(2);
}

let text;
try {
  text = fs.readFileSync(file, "utf8");
} catch (error) {
  console.error(`Cannot read ${file}: ${error.message}`);
  process.exit(2);
}

const normalized = text.replace(/\r\n/g, "\n").trimEnd();
const lines = normalized.split("\n");
const bytes = Buffer.byteLength(normalized, "utf8");
const errors = [];
const warnings = [];
const anchor =
  /^🪟 \d{4}-\d{2}-\d{2} \d{2}:\d{2} 开窗 · 接 .+ · 本窗:.+/u;

if (!normalized.trim()) errors.push("handoff is empty");
if (!anchor.test(lines[0] ?? "")) {
  errors.push("first line does not match the required window anchor");
}
for (const label of ["先读", "当前状态", "下一步"]) {
  if (!normalized.includes(label)) errors.push(`missing required section: ${label}`);
}
if (!normalized.includes("模型：")) {
  warnings.push("missing model suggestion line (模型：…) — see references/model-effort.md");
}
// 尺寸软上限按内容语言取：CJK 一个字 3 字节，拿英文口径(1024B)量中文等于只给 ~340 字，
// 而模板强制的五段(先读/当前状态/下一步/模型/纪律)在中文里塞不进 —— 恒警告 = 警告被当噪音忽略。
// 1536B ≈ 512 汉字，够写五段仍拦得住流水账；英文口径不受影响，不因此被带松。
const cjk = (normalized.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/gu) ?? []).length;
const cjkHeavy = normalized.length > 0 && cjk / normalized.length >= 0.2;
const sizeLimit = cjkHeavy ? 1536 : 1024;
if (bytes > sizeLimit) {
  warnings.push(
    `soft size limit exceeded: ${bytes} bytes > ${sizeLimit} (${cjkHeavy ? "CJK" : "latin"} 口径)`,
  );
}
if (lines.length > 25) warnings.push(`soft line limit exceeded: ${lines.length} > 25`);
if (/((ghp|github_pat|sk)-[A-Za-z0-9_-]{12,}|AKIA[0-9A-Z]{16})/u.test(normalized)) {
  errors.push("possible credential detected");
}

const result = {
  file: path.resolve(file),
  valid: errors.length === 0,
  bytes,
  lines: lines.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
