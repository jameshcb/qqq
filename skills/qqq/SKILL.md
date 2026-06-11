---
name: qqq
description: Use when the user says 切窗 / 收尾 / 结束会话 / 换窗 / 新开窗口 / qqq / 下个对话说什么, or when wrapping up a work session in any project (大里程碑完成 / auto-compact 第 2 次 / 上下文 ≥ 40% / 中文出错别字). Symptoms: about to hand off to a new window, context getting full, ending a session.
---

# qqq — 切窗复盘 + 交接 + 开新窗(全局通用)

> 全局 skill,任何项目都可 `/qqq` 触发。**项目特定锚动态读本项目的文件**(HANDOFF / CLAUDE / plan),不写死某个项目。

## Overview

切窗 = 一套**仪式**:① **诚实复盘**本会话(做得好 + **做得不好** + 提炼教训并落地)② 归档会话记录(当天一份、多窗汇总)③ 更新本项目交接文件 ④ 生成开场词 ⑤ commit+push ⑥ **开预填的新 Claude Code 标签页**。

**核心原则**:复盘**诚实、反谄媚**——「做得不好的」是必填项;教训不落到某个文件 = 白复盘。

> **能 / 不能**:复盘 + 更新交接文件 + **用 `vscode://anthropic.claude-code/open?prompt=…` 深链接开新 Claude Code 标签页并预填开场词** —— **能**(2026-06-04 实测)。**唯一手动剩一步:在新标签页按回车**(预填不自动发送 = Anthropic 设计限制)。pbcopy 进剪贴板 **不可靠**(agent Bash 够不到真 GUI 剪贴板),不用。

## When to Use

**MUST 跑**:用户说"切窗 / 收尾 / 换窗 / qqq / 下个对话说什么";会话收尾 / 上下文 ≥ 40%(≥ 70% 立即)。
**不要用**:会话中途、没有切窗意图。

## 开场先认项目(全局 skill 必做)

读本项目根的 `CLAUDE.md`(若有)→ 认它的:交接文件(`HANDOFF.md` 或等价)/ 切窗约定 / push 习惯(remote+分支)/ 决策文件(`decisions.md` 等)/ 执行追踪 skill。**后续各步锚这些项目本地约定**,不假设结构。

## 多窗并行防线(同仓库多窗已是常态;2026-06-11 实发事故固化)

共享同一工作树的另一窗口,**会在你两条命令之间切分支 / 暂存文件 / 推进 HEAD**。切窗全程:

1. **每次 `git add` 前先 `git branch --show-current` 复认分支** —— 不是开场认一次就完,是**每次 add 前**(实发:归档 commit 误落另一窗刚切过去的分支)
2. **只 add 指定路径,禁 `git add -A` / `git add .`** —— 别把另一窗的未跟踪 / 暂存文件捎走
3. **commit 已误落别的分支** → 不 reset --hard、不在共享工作树切分支救:① `git tag` 保住误落 commit(零扰动)② `git reset --soft` 还原该分支 tip ③ `git restore` 恢复对方暂存 ④ `git worktree add --detach` 隔离树里 cherry-pick 到正确分支再 push ⑤ 清 tag / worktree
4. 同项目两窗同时切窗:Step 2 归档**只追加**(既有纪律);Step 4 开场词文件名带时分(见 Step 4),互不覆盖

## 仪式(6 步,顺序走)

### Step 1 — 诚实复盘(反谄媚,核心)

三段都不许省:
- **✅ 做得好的** —— 具体到事,不空夸
- **⚠️ 做得不好的** —— **必填,≥ 1 条具体项**。禁"本次很顺利/很完美"敷衍(谄媚)。绕弯、漏了、返工、过度承诺、该问没问 —— 照实写
- **🎓 提炼教训 + 路由** —— 每条教训**必指定落地处**(否则白复盘):一次性状态 → 项目交接文件;可复用纪律 → 对应 skill 的 Red Flags;项目规范 → 项目 CLAUDE.md;业务决策 → 项目决策文件(用户拍板)。**本次确无可复用教训 → 明写「无教训 + 理由」**,禁止为凑数编教训(和谄媚同罪:既不许假装完美,也不许硬编问题)
- **路由前先查重(再踩升格闸)** —— 教训想标「暂不进 skill,再踩升格」前,先 `grep -n "🎓" docs/sessions/*.md` 扫历史教训:**同类教训已出现过 = 这就是第二次踩 = 当场升格**进对应 skill Red Flags / 项目 CLAUDE.md,不许再欠;「再踩升格」只许欠一次。全局通用的纪律(如 git / 多窗类)→ 升格进本 skill(qqq 是 plugin,改它 = 改 marketplace 仓库 + bump 版本,别因嫌麻烦把全局教训堆在项目 session 文件里)

### Step 2 — 归档会话记录(当天一份,多窗汇总)

把本会话写成纪要,**追加**到当天唯一文件 **`docs/sessions/<YYYY-MM-DD>.md`**(用 `date +%F` 取当天;项目 CLAUDE.md 若声明别的位置 / 不留 → 听项目的;默认进 git 长期留存)。
**一天一份,多个窗口当天都汇总进同一份**:文件已存在 → 文末**追加**本窗 section;不存在 → 新建带 `# <项目> 会话记录 — YYYY-MM-DD` 标题。每条 section 以 `## HH:MM · <本窗主题>` 起头,**只追加、不动旧条目**(别 read-改-写整文件,免得覆盖别窗刚写的)。
每条内容(纪要 + 关键原话,**别存逐字全文**):
- **脉络** —— 本窗做了什么,几条
- **关键决策** —— 决策 + 一句理由(详处指 decisions.md §N / 待拍板)
- **关键原话** —— 几句定调的对话原话,`> ` 引用
- **复盘 ⚠️🎓** —— 直接搬 Step 1 的「做得不好的」+「教训」,给复盘安永久的家
- **产出文件** —— 路径 + 一句话
> 定位:claude-mem 是 DB、HANDOFF 朝前看;这份是可翻可 grep 的人读历史,也是 Step 1 复盘的永久落点。

### Step 3 — 更新本项目交接文件(只写「现在」,不写历史)

把"**停在哪 / 下一步 / 待决**"写进本项目的 HANDOFF(或等价文件)。**HANDOFF 是滚动指针,不是日志**:
- 只维护「当前状态 / 下一步 / 待决」滚动区,**全文目标 ≤ 100 行** —— 会话叙事、成果复述、复盘**已在 Step 2 的 docs/sessions 里**,不在 HANDOFF 再写一份
- 本次更新后超 100 行 → 顺手把最老的历史 entry 移进项目归档文件(如 `docs/handoff-archive.md`),HANDOFF 只留指针
- 逐任务执行态若项目有专门追踪机制(如 `docs/plans/<track>/`)就放那、别堆进交接散文

### Step 4 — 生成下窗开场词

用 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md)。**自包含**:① 读什么(项目交接文件 + 相关决策 + 本会话关键产出文件路径)② 当前状态一句话 ③ 下一步选项(让下个会话跟用户确认)。缺"读什么"或"下一步"= 不合格。写进 **`/tmp/qqq-handoff-<项目名>-<HHMM>.txt`**(`<项目名>` = 项目根目录名,如 `tops`;`<HHMM>` = 写入当刻时分,`date +%H%M`)——项目名防两窗两项目互覆,**时分防同项目两窗同时切窗互覆**。

### Step 5 — commit + push

交接文件 / skill / 规范改动 commit → push 到本项目对应 remote+分支(commit 数 ≥ 5 给简短列表;**删除 / force / schema 迁移 / 密钥等红线操作先问用户**)。
**add 前先 `git branch --show-current` 复认分支 + 只 add 指定路径(禁 `-A`)**(详〈多窗并行防线〉);**`git add` 后必 `git diff --name-only` 确认暂存到位再 commit**:别把已删/不存在路径塞进 `git add`(整个 add 会中止 → 内容漏提);push 后 `git show HEAD:<file>` 核对真有改动,别 push 半截。

### Step 6 — 开预填的新 Claude Code 标签页(vscode 深链接,主路径)

```bash
HANDOFF=/tmp/qqq-handoff-<项目名>-<HHMM>.txt      # ← 写死 Step 4 实际写入的那个文件名(就在上文工具调用里)
ENC=$(node -e 'process.stdout.write(encodeURIComponent(require("fs").readFileSync(process.argv[1],"utf8")))' "$HANDOFF")
open "vscode://anthropic.claude-code/open?prompt=${ENC}"
```
> ⚠️ Step 6 用 **Step 4 实际写入的确切文件名**(刚写的,对话上下文里有,直接写死进命令);bash 调用间环境变量不保留,别指望跨步骤传变量。万一丢了:`ls -t /tmp/qqq-handoff-$(basename "$PWD")-*.txt | head -1` 取本项目最新一份(同项目双窗同时切窗时,确认时分是自己那份)。

然后一句话收尾:**新标签页已开、开场词已预填,直接按回车继续**(不必反问用户"开了没 / 对不对")。
> 兜底:深链接万一失败(URI 过长 / 扩展版本差异),提示用户"没预填上就说一声",再把开场词作可粘贴 block 贴出来,手动 New Conversation 粘贴。

## Red Flags(自检)

- 切窗只更新交接文件、**跳过复盘** → 违 Step 1
- 复盘只列"做得好的"、不列"做得不好的"(或"很完美"敷衍)→ **谄媚**,必补 ≥ 1 条真问题
- 教训写空泛、**不路由** → 白复盘
- 没真教训却硬编一条凑数 → 和谄媚同罪;明写「无教训 + 理由」即可
- 开场词不可直接粘贴(缺"读什么"或"下一步")→ 下窗接不上
- `git add` 带了已删/不存在路径 → 整个 add 中止、改动漏提还 push 半截;**add 后 `git diff --name-only` 验空 + push 后核对 HEAD**
- 深链接失败时没给兜底粘贴 block → 用户无法恢复(注:正常情况直接按回车即可,**不必反问确认**)
- 会话记录当天另起新文件 / 覆盖别窗条目 → 应**追加**到 `docs/sessions/<当天>.md` 同一份,只追加不动旧条目
- 会话记录存了逐字全文 → 噪音;只留纪要 + 关键原话 + 复盘
- 交接文件没 push 就切窗 → 下窗 pull 不到最新
- 切窗 `git add` 前没复认当前分支 / 用了 `git add -A` → 多窗共享工作树下 commit 落错分支 / 捎走别窗文件(2026-06-11 实发),按〈多窗并行防线〉走
- HANDOFF 按 session 追加成果复述、越摞越长 → 违 Step 3:叙事归 docs/sessions,HANDOFF ≤ 100 行滚动,超了归档最老 entry
- 教训标「暂不进,再踩升格」却没 grep docs/sessions 查是不是已踩过 → 升格闸空转,重复教训永远进不了 skill;全局纪律别因 plugin 更新麻烦就堆在项目 session 文件

## 单一真理源

- 切窗交接落点:本项目的 HANDOFF(或等价文件)
- 会话记录归档:本项目 `docs/sessions/YYYY-MM-DD.md`(**当天一份、多窗汇总**;或项目 CLAUDE.md 声明的位置)
- 深链接法 port 自:`yeehang2026/.claude/commands/handoff.md` 的 `/handoff`
- 项目特定增强(如 TOPS):项目本地 CLAUDE.md §切窗信号 + 项目执行追踪 skill(如 tops-phase-tracking)
