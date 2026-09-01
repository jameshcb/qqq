#!/usr/bin/env node
// 读项目根 CLAUDE.md 里的「## qqq 项目声明」段，输出 JSON 给 SKILL 各节取路径。
// qqq 是通用插件，不写死任何项目的目录；项目要让 qqq 知道帮助真源 / 事故档案 / sessions 在哪，
// 就在自己的 CLAUDE.md 里声明。契约（键名、含义、缺失时行为）只写在仓库 README「qqq 项目声明」一处，
// 本文件不复制第二份。
//
// 用法: node project-declaration.mjs [--root <项目根>]   （默认 cwd）
// 解析规则:
//   - 标题行恒为 `## qqq 项目声明`（允许尾随空白），段落到下一个任意级别标题为止。
//   - 段内每行 `- key: value`：半角冒号后一个空格；key 小写字母开头、只含小写字母/数字/下划线；value 原样 trim。
//   - 不合规则的非空行忽略并记进 warnings；重复键后者覆盖前者并记进 warnings。
// 输出: {found, root, claudeMd, declaration: {key: value…}, warnings}
// 退出码: 0 = 正常（含 found:false —— 没有 CLAUDE.md 或没有该段是降级不是失败）；2 = 参数错。

import fs from "node:fs";
import path from "node:path";

const HEADING = "## qqq 项目声明";
const ANY_HEADING = /^#{1,6} /u;
const ENTRY = /^- ([a-z][a-z0-9_]*): (.+)$/u;

function parseArgs(argv) {
  const parsed = argv.reduce(
    (acc, value, index) => {
      if (acc.skip) return { ...acc, skip: false };
      if (value === "--root") {
        const next = argv[index + 1];
        if (!next) throw new Error("--root requires a path");
        return { ...acc, root: next, skip: true };
      }
      throw new Error(`Unknown argument: ${value}`);
    },
    { root: null, skip: false },
  );
  return { root: parsed.root };
}

function extractSection(lines) {
  const start = lines.findIndex((line) => line.trimEnd() === HEADING);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => ANY_HEADING.test(line));
  return end === -1 ? rest : rest.slice(0, end);
}

function parseEntries(sectionLines) {
  return sectionLines.reduce(
    (acc, raw) => {
      const line = raw.trimEnd();
      if (!line.trim()) return acc;
      const match = ENTRY.exec(line);
      if (!match) {
        return { ...acc, warnings: [...acc.warnings, `ignored line (not \`- key: value\`): ${line}`] };
      }
      const [, key, value] = match;
      const duplicate = Object.prototype.hasOwnProperty.call(acc.declaration, key);
      return {
        declaration: { ...acc.declaration, [key]: value.trim() },
        warnings: duplicate ? [...acc.warnings, `duplicate key, last one wins: ${key}`] : acc.warnings,
      };
    },
    { declaration: {}, warnings: [] },
  );
}

function emit(result) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`Usage: project-declaration.mjs [--root <project-root>]\n${error.message}`);
  process.exit(2);
}

const root = path.resolve(options.root ?? process.cwd());
const claudeMd = path.join(root, "CLAUDE.md");

let text;
try {
  text = fs.readFileSync(claudeMd, "utf8");
} catch (error) {
  emit({
    found: false,
    root,
    claudeMd,
    declaration: {},
    warnings: [`CLAUDE.md not readable: ${error.message}`],
  });
}

const section = extractSection(text.replace(/\r\n/g, "\n").split("\n"));
if (section === null) {
  emit({
    found: false,
    root,
    claudeMd,
    declaration: {},
    warnings: [`no \`${HEADING}\` section in ${claudeMd}`],
  });
}

const { declaration, warnings } = parseEntries(section);
emit({
  found: true,
  root,
  claudeMd,
  declaration,
  warnings: Object.keys(declaration).length === 0 ? [...warnings, "section present but no entries"] : warnings,
});
