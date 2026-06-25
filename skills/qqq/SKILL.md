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
5. **多树形态(worktree 并存)同样中招:pnpm / git 一律 `git -C <绝对路径>` / `pnpm -C <绝对路径>` 或绝对路径起手,禁靠继承 cwd** —— 主树 + worktree 并存时 cwd 停在哪棵树取决于上一条命令,靠 cwd 跑测试 / add / commit = 跑错树、落错分支同款事故;**当窗刚立过规也会顺手漏,要做命令级自检**(每条命令带 -C,不是开场 cd 一次完事;2026-06-12 两窗实发二踩后升格)

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

把"**停在哪 / 下一步 / 待决**"写进本项目的 HANDOFF(或等价文件)。**HANDOFF = 前瞻指针,不是日志**:
- **写入门(治本)**:只收「还没做的」—— 当前状态 / 下一步 / 待决。一条内容只要能用「已完成」描述(✅ / commit SHA / 测试数 / 已合 PR# / 日期事件)= 历史 → 落 Step 2 的 docs/sessions,**禁进 HANDOFF**
- **更新 = 替换不是追加**:每次切窗先删掉上窗已变历史的项(✅完成的下一步、已落地的待决),再写新的下一步;HANDOFF 永远只有「现在朝前看」那一层、不积累
- **尺寸只作烟雾报警**:更新后 `wc -c HANDOFF.md` 扫一眼,异常大(经验阈值如 >20KB 或单段 >800 字符)= 历史又漏进来了的信号 → 回写入门清一遍,**而不是「删到塞得下」**;行数 / 字符数本身不是规矩,内容性质才是
- 逐任务执行态若项目有专门追踪机制(如 `docs/plans/<track>/`)就放那、别堆进交接散文

### Step 4 — 生成下窗开场词

> **原则:开场词 = 指针不是容器,状态只活在 HANDOFF,开场词只指过去。**

用 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md)。**自包含 = 列全「读什么」的指针**(项目交接文件 + 相关决策 + 本会话关键产出路径),不是把内容搬进来。三件套缺一不合格:① 读什么(指针)② 当前状态 ③ 下一步选项(让下窗跟用户确认)。

硬约束(防开场词膨胀):
- **第一行必须是带日期时间的中文主题锚**:`🪟 <YYYY-MM-DD HH:MM> 开窗 · 接 <项目> · 本窗:<中文主题一句>`,否则不合格 —— 新窗第一屏是英文 claude-mem 上下文,James 靠这行一眼认出何时开窗、干什么。时间取 Step 4 生成当刻 `date '+%Y-%m-%d %H:%M'`(文件名 `<HHMM>` 复用同一时刻 `date +%H%M`,保持一致)。主题句概括**新窗要干的事(下一步)**,是主题短语,**别把「当前状态」内容抄进锚行**(否则又违指针原则 + 双份维护)
- **「当前状态」硬性 1-2 句**:只说最新落点 + 指 HANDOFF §1。**禁内联 commit hash 流水账**(这些 HANDOFF 都有)、禁把 HANDOFF §1/§2 内容抄进开场词 —— 状态权威在 HANDOFF,开场词内联 = 双份维护、且会漂
- **禁重贴 CLAUDE/HANDOFF 已有内容**:纪律一行带过(「守 CLAUDE §N + 红线」),下窗本来就读 CLAUDE.md
- **开场词只允许在指针之外额外承载两样**:① 本窗新教训(一句)② 待决(一句)。其余一律指过去
- **软上限 ≤1KB / ≤25 行**(开场词是一次性指针、本就该极小;类比 HANDOFF 只收「还没做的」);超了 = 在抄已有内容,删到只剩指针

写进 **`/tmp/qqq-handoff-<项目名>-<HHMM>.txt`**(`<项目名>` = 项目根目录名,如 `tops`;`<HHMM>` = 写入当刻时分,`date +%H%M`)——项目名防两窗两项目互覆,**时分防同项目两窗同时切窗互覆**。

### Step 5 — commit + push

交接文件 / skill / 规范改动 commit → push 到本项目对应 remote+分支(commit 数 ≥ 5 给简短列表;**删除 / force / schema 迁移 / 密钥等红线操作先问用户**)。
**add 前先 `git branch --show-current` 复认分支 + 只 add 指定路径(禁 `-A`)**(详〈多窗并行防线〉);**`git add` 后必 `git diff --name-only` 确认暂存到位再 commit**:别把已删/不存在路径塞进 `git add`(整个 add 会中止 → 内容漏提);push 后 `git show HEAD:<file>` 核对真有改动,别 push 半截。

### Step 6 — 开预填的新 Claude Code 标签页(vscode 深链接,主路径)

```bash
HANDOFF=/tmp/qqq-handoff-<项目名>-<HHMM>.txt      # ← 写死 Step 4 实际写入的那个文件名(就在上文工具调用里)
ENC=$(node -e 'process.stdout.write(encodeURIComponent(require("fs").readFileSync(process.argv[1],"utf8")))' "$HANDOFF")

# 长度闸:Windows 协议处理器(start→ShellExecute)命令行 ≈2048 上限,URL 超了静默不开标签页(2026-06-14 同事 Windows 实发,2109 chars 炸)。
# 卡的是 encode 后长度、不是开场词原始字数:中文 UTF-8 占 3 字节,encode 后每字节→%XX,1 个中文 ≈ 9 个 encoded 字符,靠人眼数原始字数卡不准。
# encoded ≤ 1900(加 URL 头尾 ~50 仍 <2048,留 ~100 余量)→ 预填全文;超了 → 降级成「读 handoff 文件」短指针(URL 恒 ~300 字符,任意长度 handoff 都免疫)。
if [ ${#ENC} -le 1900 ]; then
  PROMPT="$ENC"
else
  # 降级短指针也带「日期时间 + 中文主题」锚(James 此时看到的是短指针本身,不是文件内容);date / $HANDOFF 由 shell 展开,<项目>/<主题> 助手写死填入(同写死文件名)
  PROMPT=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "🪟 $(date '+%Y-%m-%d %H:%M') 开窗 · 接 <项目>(本窗:<中文主题一句>)。先读 $HANDOFF 全文(读什么 / 当前状态 / 下一步都在里面),照它开场,再跟我确认走哪条。")
fi
URL="vscode://anthropic.claude-code/open?prompt=${PROMPT}"

case "$(uname -s)" in                 # 跨平台开链接(原来只写死 macOS open;报 bug 的同事在 Windows)
  Darwin) open "$URL" ;;
  Linux)  xdg-open "$URL" ;;
  *)      cmd //c start "" "$URL" ;;  # Windows(Git Bash/MSYS:MINGW*/MSYS*/CYGWIN*)
esac
```
> ⚠️ Step 6 用 **Step 4 实际写入的确切文件名**(刚写的,对话上下文里有,直接写死进命令);bash 调用间环境变量不保留,别指望跨步骤传变量。万一丢了:`ls -t /tmp/qqq-handoff-$(basename "$PWD")-*.txt | head -1` 取本项目最新一份(同项目双窗同时切窗时,确认时分是自己那份)。
> ⚠️ 降级到短指针那条**依赖 handoff 文件自包含**(Step 4 已要求);文件不自包含时降级 = 下窗读到残篇,所以 Step 4 的「读什么 / 当前状态 / 下一步」三件套是硬约束。

然后一句话收尾:**新标签页已开、开场词已预填,直接按回车继续**(不必反问用户"开了没 / 对不对");若走了降级分支,顺带说一句「这次 handoff 较长,新窗预填的是『去读 /tmp 那份』,按回车它会自己读」。
> 兜底:深链接万一失败(扩展版本差异等;URI 过长已由上面的长度闸自动降级,不再是失败因),提示用户"没预填上就说一声",再把开场词作可粘贴 block 贴出来,手动 New Conversation 粘贴。

## Red Flags(自检)

- 切窗只更新交接文件、**跳过复盘** → 违 Step 1
- 复盘只列"做得好的"、不列"做得不好的"(或"很完美"敷衍)→ **谄媚**,必补 ≥ 1 条真问题
- 教训写空泛、**不路由** → 白复盘
- 没真教训却硬编一条凑数 → 和谄媚同罪;明写「无教训 + 理由」即可
- 开场词不可直接粘贴(缺"读什么"或"下一步")→ 下窗接不上
- `git add` 带了已删/不存在路径 → 整个 add 中止、改动漏提还 push 半截;**add 后 `git diff --name-only` 验空 + push 后核对 HEAD**
- 深链接失败时没给兜底粘贴 block → 用户无法恢复(注:正常情况直接按回车即可,**不必反问确认**)
- Step 6 直接 `open "...?prompt=${ENC}"` 不卡长度 / 按「原始字数」估长度 → Windows `start`(ShellExecute)≈2048 上限,URL 超了**静默不开标签页**(2026-06-14 同事实发);中文 encode 膨胀 ~9x,**必须按 `${#ENC}` 卡 encoded 长度**(≤1900),超了走「读 handoff 文件」短指针降级,别靠数原始字数
- Step 6 写死 macOS `open` → Windows / Linux 同事开不了;**按 `uname -s` 分支** `open` / `xdg-open` / `cmd //c start`
- 会话记录当天另起新文件 / 覆盖别窗条目 → 应**追加**到 `docs/sessions/<当天>.md` 同一份,只追加不动旧条目
- 会话记录存了逐字全文 → 噪音;只留纪要 + 关键原话 + 复盘
- 交接文件没 push 就切窗 → 下窗 pull 不到最新
- 切窗 `git add` 前没复认当前分支 / 用了 `git add -A` → 多窗共享工作树下 commit 落错分支 / 捎走别窗文件(2026-06-11 实发),按〈多窗并行防线〉走
- HANDOFF 写进已完成的事(✅ / commit SHA / 测试数 / 已合 PR# / 过去事件)→ 违 Step 3 写入门:历史归 docs/sessions,HANDOFF 只收「还没做的」
- HANDOFF 越摞越长 / 单段塞成数千字符的巨段 → 是症状不是病:根因 = 历史漏进来了(纯尺寸闸 ≤100 行 / ≤800 字符曾形同虚设、胖单格照样膨到 14KB)→ 按写入门删已完成项,不是压缩措辞
- 开场词把 HANDOFF §1/§2 内容内联抄一遍 / 贴 commit hash 流水账 / 整段重贴 CLAUDE 红线 → 违 Step 4「指针不是容器」:当前状态压到 1-2 句指 HANDOFF §1,纪律一行带过,只额外带「本窗新教训 + 待决」,≤1KB/≤25 行
- 开场词每窗往「当前状态」append 自己的里程碑、和 HANDOFF 一起涨 → 双份维护、会漂;状态只活在 HANDOFF,开场词只指过去
- 开场词第一行缺日期时间 / 缺中文主题锚(降级短指针同样)→ 违 Step 4:新窗第一屏全是英文 claude-mem 上下文,没这条 `🪟 <日期时间> 开窗 · 接 <项目> · 本窗:…` James 一眼认不出何时开窗、干什么
- 教训标「暂不进,再踩升格」却没 grep docs/sessions 查是不是已踩过 → 升格闸空转,重复教训永远进不了 skill;全局纪律别因 plugin 更新麻烦就堆在项目 session 文件
- worktree 并存下 pnpm / git 靠继承 cwd、不带 `-C`/绝对路径 → 跑错树/落错分支高危(2026-06-12 二踩升格),按〈多窗并行防线〉第 5 条命令级自检
- 多行 git commit message 用 `git commit -F -` 喂 stdin 或 heredoc → ① 喂 stdin 跨子命令行为不一致 ② commit 前 hook/guard 看整条命令串、heredoc body 里的命令字样(vitest / prisma / rm 等)被误拦 exit 非 0;**一律 Write 临时文件 + `git commit -F <临时文件>`,禁 `-F -` + heredoc**(2026-06-13 三踩升格兑现)

## 单一真理源

- 切窗交接落点:本项目的 HANDOFF(或等价文件)
- 会话记录归档:本项目 `docs/sessions/YYYY-MM-DD.md`(**当天一份、多窗汇总**;或项目 CLAUDE.md 声明的位置)
- 深链接法 port 自:`yeehang2026/.claude/commands/handoff.md` 的 `/handoff`
- 项目特定增强(如 TOPS):项目本地 CLAUDE.md §切窗信号 + 项目执行追踪 skill(如 tops-phase-tracking)
