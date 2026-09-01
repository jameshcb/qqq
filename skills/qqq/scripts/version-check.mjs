#!/usr/bin/env node
// qqq 自身版本自检 —— 回答「我现在跑的这套 qqq，是不是已经过期了」。
//
// 为什么需要：插件按版本号解包到 plugins/cache/<owner>/qqq/<version>/，会话加载的是**那一份**。
// 另一台机发了新版、或本机 pull 了仓却没跑 `claude plugin update`，当前会话照旧跑旧版且**毫无提示** ——
// 2026-07-30 实发：整套切窗仪式跑在 1.1.0 上，而远端已到 1.3.0，三笔改进一条没生效，
// 其中一笔恰好就是当时踩的坑（尺寸报警后只清了自己刚加的那点）。旧版不会报错，它只是安静地少做事。
//
// 用法: node version-check.mjs [--no-remote]
//   默认连远端一起核（fetch 很快）；--no-remote 只比本地两处，离线可用。
// 退出码恒 0 —— 这是提示不是闸，不该挡住切窗。

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const checkRemote = !process.argv.includes("--no-remote");

/// 当前**运行中**的版本，两种来源：
///   cache-path       插件态 —— cache 路径自带版本号(.../cache/<owner>/qqq/<version>/skills/qqq/scripts/)。
///   repo-plugin-json 开发态直跑仓库 —— cache 正则匹配不到，退回读自身旁的 <仓根>/.claude-plugin/plugin.json；
///                    跑的就是这份代码，所以它同样是「运行中的版本」，只是来源不同，下游据此不必再写「未知」。
/// 两处都取不到（脚本被单独拷出仓库结构）才是 null。
const selfPath = fileURLToPath(import.meta.url);
let runningVersion = selfPath.match(/\/cache\/[^/]+\/qqq\/([^/]+)\//)?.[1] ?? null;
let runningVersionSource = runningVersion ? "cache-path" : null;
if (!runningVersion) {
  // scripts → skills/qqq/scripts → 仓根；插件态与开发态这段目录结构相同。
  const selfPluginJson = path.resolve(path.dirname(selfPath), "../../../.claude-plugin/plugin.json");
  try {
    const json = JSON.parse(fs.readFileSync(selfPluginJson, "utf8"));
    if (json?.name === "qqq" && json?.version) {
      runningVersion = json.version;
      runningVersionSource = "repo-plugin-json";
    }
  } catch {
    /* 不在仓库结构里，维持 null */
  }
}

/// 本机 marketplace 仓里的 qqq(= `claude plugin update` 会装的那一版)。
function findMarketplaceRepo() {
  const base = path.join(os.homedir(), ".claude", "plugins", "marketplaces");
  let owners = [];
  try {
    owners = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return null;
  }
  for (const owner of owners) {
    const repo = path.join(base, owner.name);
    for (const rel of [".claude-plugin/plugin.json", "plugins/qqq/.claude-plugin/plugin.json"]) {
      const file = path.join(repo, rel);
      try {
        const json = JSON.parse(fs.readFileSync(file, "utf8"));
        if (json?.name === "qqq" && json?.version) return { repo, version: json.version };
      } catch {
        /* 该路径没有或不是 qqq，继续找 */
      }
    }
  }
  return null;
}

const local = findMarketplaceRepo();
const notes = [];
let behind = null;

if (checkRemote && local) {
  try {
    execFileSync("git", ["-C", local.repo, "fetch", "--quiet", "origin"], { timeout: 20000 });
    behind = Number(
      execFileSync("git", ["-C", local.repo, "rev-list", "--count", "HEAD..origin/main"], {
        encoding: "utf8",
        timeout: 20000,
      }).trim(),
    );
  } catch (error) {
    // 离线/无权限/无 remote 都不算失败：降级成只比本地，并如实说明没核到远端。
    notes.push(`remote check skipped: ${error.message.split("\n")[0]}`);
  }
}

const stale = [];
if (runningVersion && local && runningVersion !== local.version) {
  // 开发态两边本就是不同 clone，方向可能是「仓比 marketplace 新」，别照插件态那句喊「你落后了」。
  stale.push(
    runningVersionSource === "repo-plugin-json"
      ? `开发态直跑的仓库是 ${runningVersion}，本机 marketplace 仓是 ${local.version} —— 两处不同步，发版后 \`git -C ${local.repo} pull --ff-only\` 再 \`claude plugin update qqq@<owner>\``
      : `运行中的是 ${runningVersion}，而本机 marketplace 仓已是 ${local.version} —— 跑 \`claude plugin update qqq@<owner>\` 后**重启**才生效`,
  );
}
if (behind !== null && behind > 0) {
  stale.push(
    `本机 qqq 仓落后远端 ${behind} 笔 —— 别人发过版；\`git -C ${local.repo} pull --ff-only\` 后再 update 插件`,
  );
}

const result = {
  runningVersion,
  runningVersionSource,
  marketplaceVersion: local?.version ?? null,
  marketplaceRepo: local?.repo ?? null,
  behindRemote: behind,
  upToDate: stale.length === 0,
  stale,
  notes,
};

console.log(JSON.stringify(result, null, 2));
if (stale.length > 0) {
  console.error("\n⚠️ qqq 版本对不上，本次仪式可能跑在过期版上：");
  for (const s of stale) console.error(`   · ${s}`);
}
process.exit(0);
