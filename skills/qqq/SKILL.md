---
name: qqq
description: 当用户明确要结束当前 Claude Code 会话并交给下一窗口时，完成诚实复盘、会话归档、项目交接和下窗开场。用户输入“qqq”或明确要求“完整收尾”时可执行完整仪式；普通“帮我写交接/下个对话说什么”只做交接，不得自动 commit、push 或开新窗口。会话仍在进行、只是讨论 handoff 概念时不要触发。
argument-hint: "[preview|handoff|full|no-push] [下窗主题]"
---

# qqq — 切窗复盘与交接

把当前会话可靠地交给下一窗口。先判断模式，再按顺序执行；项目本地约定永远优先。

本次参数：`$ARGUMENTS`

## 1. 先判定模式

- `preview`：只读检查并展示拟写内容；不改文件、不改 Git、不打开窗口。
- `handoff`：执行复盘、归档、更新 HANDOFF、生成开场词；不 commit、不 push、不打开窗口。
- `no-push`：执行完整仪式，可 commit，但不得 push；随后可打开新窗口。
- `full`：执行完整仪式，包括符合授权边界的 commit、push 和打开新窗口。
- 未给模式时：
  - 用户直接运行 `/qqq:qqq` 且未带参数 → `full`。
  - 用户消息是纯 `qqq`，或明确说“完整收尾 / 切窗并推送 / 跑完整 qqq” → `full`。
  - 用户只要交接文案、下窗提示词或会话总结 → `handoff`。
  - 意图仍不清楚且会改变远端状态 → 先按 `preview`，把差异说明给用户。

任何仍然生效的 `no-push`、`STOP`、只读或“不要提交”指令都覆盖模式默认值。

## 2. 识别项目与安全边界

1. 找项目根；读取根目录的 `CLAUDE.md`、`HANDOFF.md` 或等价文件，以及项目声明的计划、决策和收尾脚本。
2. 记录开始时的分支、HEAD、工作树状态和已存在的改动。不要把用户或其他窗口的改动算成 qqq 产出。
3. 有 Git remote 时 fetch 并检查相对 upstream 的 ahead/behind；落后、分叉或共享工作树在执行中换分支时，停止 Git 写操作并报告。
4. 没有 Git、没有 remote 或项目明确不归档时，继续完成能安全完成的步骤，不把环境差异当失败。

执行任何 Git 写操作前，完整阅读 [references/git-safety.md](references/git-safety.md)。

## 3. 诚实复盘

必须覆盖三项：

- `✅ 做得好的`：具体到本窗做成的事。
- `⚠️ 做得不好的`：至少一项真实问题；不准用“很顺利/很完美”敷衍。
- `🎓 教训与去向`：说明教训应落在哪里。

路由原则：

- 一次性状态 → HANDOFF。
- 本项目规范 → 项目 `CLAUDE.md`。
- 业务决策 → 项目决策文件；需要用户拍板时只记录待决，不代拍。
- 可复用工作流纪律 → 对应 skill 或 reference。
- 没有可复用教训时，明确写“无可复用教训”并给理由，不为凑数编造。

项目有会话历史时，先搜索同类教训。重复出现说明应升级成稳定规则，不能继续标“下次再说”。

## 4. 归档本窗

默认追加到 `docs/sessions/<YYYY-MM-DD>.md`；项目约定了其他位置或明确不留 sessions 时服从项目。

- 当天一份，多窗口只追加新 section，不重写旧记录。
- section 标题：`## HH:MM · <本窗主题>`。
- 内容只保留脉络、关键决策、少量关键原话、复盘中的 `⚠️`/`🎓`、产出文件。
- 不保存逐字聊天全文，不把秘密、token、个人敏感信息写进仓库。

`preview` 模式只展示拟追加的 section。

## 5. 更新交接文件

HANDOFF 只写“现在朝前看”：

- 当前状态：停在哪里。
- 下一步：可执行选项。
- 待决：仍需用户决定的事项。

先移除已经完成、已经合并或已有 SHA/测试结果证明结束的历史项；这些历史只进 sessions。更新是替换当前层，不是无限追加。项目没有交接文件时，新建最小三段骨架。

交接文件按角色、机器或 owner 分段时，把「要对方做的事」写进**对方读的那一段**；写在自己那段等于没写，对方开场只扫他自己那段。每写一条先问：谁会因为这条动手，他开场读哪一段。同样适用于「提了请求就算通知到」——请求躺在队列文件里、而对方的任务段没有对应条目，他照样排不进去。

交接文件超出项目的尺寸约定时，按内容性质整类清理，不是把本窗新增删回去。**清完余量很小 = 只清了自己刚加的那点，下窗必再超标**；判据是逐段自问「这段能不能用『已完成』开头」，能就整批移进 sessions。

如果交接文件在 qqq 开始前已有未提交改动，不覆盖、不整文件暂存；尽量做局部编辑，并在提交前让用户确认重叠内容。

## 6. 生成并验证下窗开场词

按 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md) 填写，保存到：

`/tmp/qqq-handoff-<项目名>-<YYYYMMDD-HHMM>-<session短ID>.txt`

使用日期和 `${CLAUDE_SESSION_ID}` 前 8 位避免同项目并发窗口互相覆盖。开场词必须：

- 第一行是 `🪟 YYYY-MM-DD HH:MM 开窗 · 接 <项目> · 本窗:<中文主题>`。
- 包含“先读 / 当前状态 / 下一步”三件套。
- 当前状态只写 1–2 句并指向 HANDOFF；不开 commit 流水账。
- 含一行「模型：」建议：按 [references/model-effort.md](references/model-effort.md) 依下窗主题判定模型与 effort。
- 只额外携带一句本窗新教训和一句待决。
- 目标不超过 1KB、25 行；超出时删重复内容，保留指针。

写完运行：

```bash
node "${CLAUDE_SKILL_DIR}/scripts/validate-handoff.mjs" "<实际文件路径>"
```

验证失败先修，不带病进入下一步。`preview` 模式展示内容但不落盘。

## 7. 收尾 Git

仅 `full` 与 `no-push` 进入本节；项目声明了收尾脚本时优先按脚本执行，同时仍受本 skill 的 no-push 闸约束。

- 只提交本次 qqq 产生且确认无重叠的路径。
- 每次 add 前复认分支；禁 `git add .`、`git add -A`、`git commit -a`。
- 暂存后检查 staged diff；commit 后核对 `git show --stat HEAD`。
- `no-push` 到 commit 为止。
- `full` 只有在用户授权、项目允许、upstream 未落后且不存在活跃 no-push 指令时才 push。
- 任何删除、force push、rebase、merge、密钥变更或 schema 迁移都不属于 qqq 默认权限。

若本次改的是 qqq 插件本体，按 [references/git-safety.md](references/git-safety.md) 的“qqq 发版”检查版本和验证，但除非用户明确要求发布，否则不要 push。

## 8. 打开下一窗口

仅 `full` 或 `no-push` 执行。先确认当前宿主支持 VS Code 的 Claude Code 深链接，然后运行：

```bash
node "${CLAUDE_SKILL_DIR}/scripts/open-handoff.mjs" \
  --file "<实际文件路径>" \
  --project "<项目名>" \
  --topic "<中文主题>"
```

脚本会按 encoded URL 长度自动选择“全文预填”或“短指针预填”。打开失败时，把开场词原样放进可复制代码块，提示用户手动新建会话粘贴。

## 9. 最终回报

用短清单说明：

- 采用的模式。
- 归档、HANDOFF、开场词各写到哪里。
- commit / push / 开窗分别是否执行；未执行时说明原因。
- 新窗口若已打开：开场词已预填，用户只需按回车。

不要把“未 push”“没有 remote”“宿主不支持深链接”伪装成成功。
