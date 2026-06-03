---
name: qqq
description: Use when the user says 切窗 / 收尾 / 结束会话 / 换窗 / 新开窗口 / qqq / 下个对话说什么, or when wrapping up a work session in any project (大里程碑完成 / auto-compact 第 2 次 / 上下文 ≥ 40% / 中文出错别字). Symptoms: about to hand off to a new window, context getting full, ending a session.
---

# qqq — 切窗复盘 + 交接 + 开新窗(全局通用)

> 全局 skill,任何项目都可 `/qqq` 触发。**项目特定锚动态读本项目的文件**(HANDOFF / CLAUDE / plan),不写死某个项目。

## Overview

切窗 = 一套**仪式**:① **诚实复盘**本会话(做得好 + **做得不好** + 提炼教训并落地)② 更新本项目交接文件 ③ 生成开场词 ④ commit+push ⑤ **开预填的新 Claude Code 标签页**。

**核心原则**:复盘**诚实、反谄媚**——「做得不好的」是必填项;教训不落到某个文件 = 白复盘。

> **能 / 不能**:复盘 + 更新交接文件 + **用 `vscode://anthropic.claude-code/open?prompt=…` 深链接开新 Claude Code 标签页并预填开场词** —— **能**(2026-06-04 实测)。**唯一手动剩一步:在新标签页按回车**(预填不自动发送 = Anthropic 设计限制)。pbcopy 进剪贴板 **不可靠**(agent Bash 够不到真 GUI 剪贴板),不用。

## When to Use

**MUST 跑**:用户说"切窗 / 收尾 / 换窗 / qqq / 下个对话说什么";会话收尾 / 上下文 ≥ 40%(≥ 70% 立即)。
**不要用**:会话中途、没有切窗意图。

## 开场先认项目(全局 skill 必做)

读本项目根的 `CLAUDE.md`(若有)→ 认它的:交接文件(`HANDOFF.md` 或等价)/ 切窗约定 / push 习惯(remote+分支)/ 决策文件(`decisions.md` 等)/ 执行追踪 skill。**后续各步锚这些项目本地约定**,不假设结构。

## 仪式(5 步,顺序走)

### Step 1 — 诚实复盘(反谄媚,核心)

三段都不许省:
- **✅ 做得好的** —— 具体到事,不空夸
- **⚠️ 做得不好的** —— **必填,≥ 1 条具体项**。禁"本次很顺利/很完美"敷衍(谄媚)。绕弯、漏了、返工、过度承诺、该问没问 —— 照实写
- **🎓 提炼教训 + 路由** —— 每条教训**必指定落地处**(否则白复盘):一次性状态 → 项目交接文件;可复用纪律 → 对应 skill 的 Red Flags;项目规范 → 项目 CLAUDE.md;业务决策 → 项目决策文件(用户拍板)

### Step 2 — 更新本项目交接文件

把"**停在哪 / 下一步 / 待决**"写进本项目的 HANDOFF(或等价文件)。逐任务执行态若项目有专门追踪机制就放那、别堆进交接散文。

### Step 3 — 生成下窗开场词

用 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md)。**自包含**:① 读什么(项目交接文件 + 相关决策 + 本会话关键产出文件路径)② 当前状态一句话 ③ 下一步选项(让下个会话跟用户确认)。缺"读什么"或"下一步"= 不合格。写进 `/tmp/qqq-handoff-next.txt`。

### Step 4 — commit + push

交接文件 / skill / 规范改动 commit → push 到本项目对应 remote+分支(commit 数 ≥ 5 给简短列表;**删除 / force / schema 迁移 / 密钥等红线操作先问用户**)。
**`git add` 后必 `git diff --name-only` 确认暂存到位再 commit**:别把已删/不存在路径塞进 `git add`(整个 add 会中止 → 内容漏提);push 后 `git show HEAD:<file>` 核对真有改动,别 push 半截。

### Step 5 — 开预填的新 Claude Code 标签页(vscode 深链接,主路径)

```bash
ENC=$(node -e 'process.stdout.write(encodeURIComponent(require("fs").readFileSync(process.argv[1],"utf8")))' /tmp/qqq-handoff-next.txt)
open "vscode://anthropic.claude-code/open?prompt=${ENC}"
```
然后告诉用户:**新标签页已开、第一句已预填,按回车继续**。
> ⚠️ agent 看不到用户屏幕 → **别声称"已成功打开",让用户确认标签页 + 预填到位**。
> 兜底:深链接失败(URI 过长 / 扩展版本差异)→ 把开场词作可粘贴 block 给用户手动 New Conversation 粘贴。

## Red Flags(自检)

- 切窗只更新交接文件、**跳过复盘** → 违 Step 1
- 复盘只列"做得好的"、不列"做得不好的"(或"很完美"敷衍)→ **谄媚**,必补 ≥ 1 条真问题
- 教训写空泛、**不路由** → 白复盘
- 开场词不可直接粘贴(缺"读什么"或"下一步")→ 下窗接不上
- `git add` 带了已删/不存在路径 → 整个 add 中止、改动漏提还 push 半截;**add 后 `git diff --name-only` 验空 + push 后核对 HEAD**
- 深链接 `open` 后不让用户确认就声称"已打开" → 看不到屏幕,可能没开成
- 交接文件没 push 就切窗 → 下窗 pull 不到最新

## 单一真理源

- 切窗交接落点:本项目的 HANDOFF(或等价文件)
- 深链接法 port 自:`yeehang2026/.claude/commands/handoff.md` 的 `/handoff`
- 项目特定增强(如 TOPS):项目本地 CLAUDE.md §切窗信号 + 项目执行追踪 skill(如 tops-phase-tracking)
