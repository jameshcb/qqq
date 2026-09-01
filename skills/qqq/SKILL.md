---
name: qqq
description: 当用户明确要结束当前 Claude Code 会话并交给下一窗口时，完成诚实复盘、会话归档、项目交接和下窗开场。用户输入“qqq”或明确要求“完整收尾”时可执行完整仪式；普通“帮我写交接/下个对话说什么”只做交接，不得自动 commit、push 或开新窗口。会话仍在进行、只是讨论 handoff 概念时不要触发。
argument-hint: "[preview|handoff|full|no-push] [下窗主题]"
---

# qqq — 切窗复盘与交接

把当前会话可靠地交给下一窗口。先判断模式，再按顺序执行；项目本地约定永远优先。本次参数：`$ARGUMENTS`

## 1. 先判定模式

- `preview`：只读检查并展示拟写内容；不改文件、不改 Git、不打开窗口。
- `handoff`：执行复盘、归档、更新 HANDOFF、生成开场词；不 commit、不 push、不打开窗口。
- `no-push`：执行完整仪式，可 commit，但不得 push；随后可打开新窗口。
- `full`：执行完整仪式，包括符合授权边界的 commit、push 和打开新窗口。
- 未给模式时：用户直接运行 `/qqq:qqq` 且未带参数、消息是纯 `qqq`、或明确说“完整收尾 / 切窗并推送 / 跑完整 qqq” → `full`；只要交接文案、下窗提示词或会话总结 → `handoff`；意图仍不清楚且会改变远端状态 → 先按 `preview`，把差异说明给用户。

任何仍然生效的 `no-push`、`STOP`、只读或“不要提交”指令都覆盖模式默认值。

## 2. 识别项目与安全边界

1. 找项目根，先读项目声明：`node "${CLAUDE_SKILL_DIR}/scripts/project-declaration.mjs" --root "<项目根>"`。`found:true` 时后续各节按声明的路径做（键：`help_dir` / `help_generators` / `incident_archive` / `sessions_dir` / `handoff` / `backlog` / `finish_script`，格式与样例见 [README「qqq 项目声明」](../../README.md#qqq-项目声明)）；`found:false` 或缺某键 = 该项目没有该约定，按各节写明的默认行为。再读根目录 `CLAUDE.md`、交接文件及项目声明的计划、决策文件。
2. 记录开始时的分支、HEAD、工作树状态和已存在的改动。不要把用户或其他窗口的改动算成 qqq 产出。
3. 有 Git remote 时 fetch 并检查相对 upstream 的 ahead/behind；落后、分叉或共享工作树在执行中换分支时，停止 Git 写操作并报告。执行任何 Git 写操作前，完整阅读 [references/git-safety.md](references/git-safety.md)。
4. 没有 Git、没有 remote 或项目明确不归档时，继续完成能安全完成的步骤，不把环境差异当失败。
5. 核一次 qqq 自身版本：`node "${CLAUDE_SKILL_DIR}/scripts/version-check.mjs"`。会话加载的是 `plugins/cache/<owner>/qqq/<version>/` 那一份，旧版不报错只是安静地少做事（动机见脚本头注）；落后就先告诉用户再往下走（更新后需重启才生效），不自动改他的插件安装；离线自行降级，不当失败。

## 3. 诚实复盘

必须覆盖三项：`✅ 做得好的`（具体到本窗做成的事）、`⚠️ 做得不好的`（至少一项真实问题；不准用“很顺利/很完美”敷衍）、`🎓 教训与去向`（说明教训应落在哪里）。路由原则：

- 一次性状态 → HANDOFF。
- 本项目规范 → 项目 `CLAUDE.md` **只进一行判据**；事故叙事全文进声明的 `incident_archive`（取下一个 C-NN 编号），**同族再踩只追加档案、不动 `CLAUDE.md` 正文**；无 `incident_archive` 时才整段写进 `CLAUDE.md`。（2026-08-07 起：叙事回流正文曾让一份 CLAUDE.md 三周反弹 5 倍。）
- 业务决策 → 项目决策文件；需要用户拍板时只记录待决，不代拍。
- 可复用工作流纪律 → 对应 skill 或 reference。
- **别人照着做的操作口径 → 声明的 `help_dir`**。判据 = 本窗有没有改动“别人照旧做就会做错”的东西：新界面、换了填法、改了术语、加了闸。**必须显式写“有”或“无”**（落盘格式见 §4），不许跳过不提；无 `help_dir` 时写“无”，理由写“项目未声明 help_dir”，本窗又确实改了口径的话理由里点名改了什么、提醒用户补声明。落笔前先过 [references/knowledge-routing.md](references/knowledge-routing.md) 的两问（读者与权限门 / 常青还是快照）；改了帮助内容且声明了 `help_generators` 就重跑并连生成物一起提交。
- 没有可复用教训时，明确写“无可复用教训”并给理由，不为凑数编造。
- 项目有会话历史时，先搜索同类教训。重复出现说明应升级成稳定规则，不能继续标“下次再说”。

## 4. 归档本窗

追加到声明的 `sessions_dir`（默认 `docs/sessions/`）下的 `<YYYY-MM-DD>.md`；项目明确不留 sessions 时服从项目。

- 当天一份，多窗口只追加新 section，不重写旧记录；section 标题：`## HH:MM · <本窗主题>`。
- 内容只保留脉络、关键决策、少量关键原话、复盘中的 `⚠️`/`🎓`、产出文件；不保存逐字聊天全文，不把秘密、token、个人敏感信息写进仓库。
- section 里固定两行表态（建议放末尾；可带 `- ` 列表符或 `**` 加粗，其余一字不差）：

```text
帮助/FAQ: 有 <文件路径>（<编号>）    或    帮助/FAQ: 无（<一句理由>）
qqq 版本: <runningVersion>           自检报落后时写    qqq 版本: X.Y.Z（落后，marketplace=Y.Y.Y，缺:<一句>）
```

  `runningVersion` 取 §2 自检输出（开发态直跑仓库时它回退读仓根 `plugin.json`，同样有值）；仅在它确为 null 时写 `qqq 版本: 未知（<原因>）`。

写完运行 `node "${CLAUDE_SKILL_DIR}/scripts/validate-session.mjs" "<session 文件>"`：它取文件里最后一个 `## HH:MM ·` section 核这两行，缺一项 exit 1 并逐条说明，修完再进下一步。`preview` 模式只展示拟追加的 section，不落盘也不跑此脚本。

## 5. 更新交接文件

交接文件（声明的 `handoff`，默认 `HANDOFF.md` 或等价文件）只写“现在朝前看”三段：当前状态（停在哪里）、下一步（可执行选项）、待决（仍需用户决定的事项）。先移除已经完成、已经合并或已有 SHA/测试结果证明结束的历史项；这些历史只进 sessions。更新是替换当前层，不是无限追加。项目没有交接文件时，新建最小三段骨架。

四条卫生判据（叙事与实发见 [references/handoff-hygiene.md](references/handoff-hygiene.md)）：

- 交接文件按角色/机器分段时，要对方做的事写进**对方读的那一段**；提了请求而对方任务段没条目 = 没通知到。
- 超尺寸时按性质整类清，判据是逐段问「这段能不能用『已完成』开头」；清完余量很小 = 只清了自己刚加的那点，下窗必再超标。
- 提交被闸拦下后，下次 commit 前先对一眼 `git diff --cached --name-only` 与 `git diff --name-only`，两条清单不一致先补 `git add` 或撤出，别直接重试。
- 本窗做完的活回声明的 `backlog` 逐条划掉或改写；无 `backlog` 声明时跳过并在回报里说明。

如果交接文件在 qqq 开始前已有未提交改动，不覆盖、不整文件暂存；尽量做局部编辑，并在提交前让用户确认重叠内容。

## 6. 生成并验证下窗开场词

按 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md) 填写，保存到 `/tmp/qqq-handoff-<项目名>-<YYYYMMDD-HHMM>-<session短ID>.txt`（日期 + `${CLAUDE_SESSION_ID}` 前 8 位，避免同项目并发窗口互相覆盖）。开场词必须：

- 第一行是 `🪟 YYYY-MM-DD HH:MM 开窗 · 接 <项目> · 本窗:<中文主题>`。
- 包含“先读 / 当前状态 / 下一步”三件套；当前状态只写 1–2 句并指向 HANDOFF，不开 commit 流水账。
- 含一行「模型：」建议：按 [references/model-effort.md](references/model-effort.md) 依下窗主题判定模型与 effort；只额外携带一句本窗新教训和一句待决。
- 目标不超过 25 行；字节软上限**按内容语言分档**（中文等 CJK 1.5KB ≈ 512 字 / 拉丁文 1KB），`validate-handoff.mjs` 自动判。超出时删重复内容、保留指针，别删掉三件套里的指针去凑数。

写完运行 `node "${CLAUDE_SKILL_DIR}/scripts/validate-handoff.mjs" "<实际文件路径>"`。验证失败先修，不带病进入下一步。`preview` 模式展示内容但不落盘。

## 7. 收尾 Git

仅 `full` 与 `no-push` 进入本节；声明了 `finish_script` 时优先按脚本执行，同时仍受本 skill 的 no-push 闸约束；无声明按下列步骤手工做。

- 只提交本次 qqq 产生且确认无重叠的路径；每次 add 前复认分支；禁 `git add .`、`git add -A`、`git commit -a`。
- 暂存后检查 staged diff；commit 后核对 `git show --stat HEAD`。
- `no-push` 到 commit 为止；`full` 只有在用户授权、项目允许、upstream 未落后且不存在活跃 no-push 指令时才 push。
- 任何删除、force push、rebase、merge、密钥变更或 schema 迁移都不属于 qqq 默认权限。
- 若本次改的是 qqq 插件本体，按 [references/git-safety.md](references/git-safety.md) 的“qqq 发版”检查版本和验证，但除非用户明确要求发布，否则不要 push。

## 8. 打开下一窗口

仅 `full` 或 `no-push` 执行。先确认当前宿主支持 VS Code 的 Claude Code 深链接，然后运行 `node "${CLAUDE_SKILL_DIR}/scripts/open-handoff.mjs" --file "<实际文件路径>" --project "<项目名>" --topic "<中文主题>"`；脚本会按 encoded URL 长度自动选择“全文预填”或“短指针预填”。打开失败时，把开场词原样放进可复制代码块，提示用户手动新建会话粘贴。**开窗脚本失败、或仪式没执行到这一步，都必须显式说「本次未开新窗」**，不许静默停在中途（2026-08-19 实发：仪式跑一半没开窗，用户肉眼才发现）。

## 9. 最终回报

用短清单说明，不要把“未 push”“没有 remote”“宿主不支持深链接”伪装成成功：

- 采用的模式，并把 §4 落盘的「qqq 版本:」那一行原样复述（落后过就一并说明）——让用户一眼看出仪式是不是过期版本跑的。
- 归档、HANDOFF、开场词各写到哪里。
- 把 §4 落盘的「帮助/FAQ:」那一行原样复述；“有”就再说一句给谁看——让用户当场看出知识库有没有跟上。
- 副作用回执，一行固定格式、每项二选一：`commit ✓ <sha> | ✗（原因） / push ✓ | ✗（原因） / 开窗 ✓ | ✗（原因）`。
- 新窗口若已打开：开场词已预填，用户只需按回车。
