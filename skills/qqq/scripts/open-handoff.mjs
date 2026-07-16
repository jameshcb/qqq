#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const options = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (["--file", "--project", "--topic"].includes(value)) {
      options[value.slice(2)] = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  return options;
}

function required(value, name) {
  if (!value) throw new Error(`Missing required option: --${name}`);
  return value;
}

function openUrl(url) {
  const platform = os.platform();
  if (platform === "darwin") return spawnSync("open", [url], { stdio: "ignore" });
  if (platform === "linux") return spawnSync("xdg-open", [url], { stdio: "ignore" });
  if (platform === "win32") {
    return spawnSync("explorer.exe", [url], {
      stdio: "ignore",
      windowsHide: true,
    });
  }
  return { status: 1, error: new Error(`Unsupported platform: ${platform}`) };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const file = path.resolve(required(options.file, "file"));
  const project = required(options.project, "project");
  const topic = required(options.topic, "topic");
  const handoff = fs.readFileSync(file, "utf8");
  const fullPrompt = encodeURIComponent(handoff);
  const now = new Date();
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(",", "");
  const shortText =
    `🪟 ${stamp} 开窗 · 接 ${project} · 本窗:${topic}。` +
    `先读 ${file} 全文，再复验项目 HANDOFF 和 git 状态；文件若不存在，改读项目 HANDOFF 与今天的 session 记录。`;
  const pointerPrompt = encodeURIComponent(shortText);
  const minimalPrompt = encodeURIComponent(`读取交接文件：${file}`);
  let mode = "full";
  let prompt = fullPrompt;
  if (fullPrompt.length > 1900) {
    mode = "pointer";
    prompt = pointerPrompt;
  }
  if (prompt.length > 1900) {
    mode = "minimal-pointer";
    prompt = minimalPrompt;
  }
  if (prompt.length > 1900) {
    throw new Error("handoff file path is too long for a safe VS Code deep link");
  }
  const url = `vscode://anthropic.claude-code/open?prompt=${prompt}`;
  const result = {
    mode,
    encodedPromptLength: prompt.length,
    urlLength: url.length,
    file,
    opened: false,
  };

  if (options.dryRun) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  const opened = openUrl(url);
  if (opened.status !== 0) {
    throw opened.error ?? new Error(`opener exited with status ${opened.status}`);
  }
  result.opened = true;
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(`open-handoff failed: ${error.message}`);
  process.exit(1);
}
