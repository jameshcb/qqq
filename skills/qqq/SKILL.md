---
name: qqq
description: Use when the user says 切窗 / 收尾 / 结束会话 / 换窗 / 新开窗口 / qqq / 交接 / handoff / 下个对话说什么, or when wrapping up a work session in any project (大里程碑完成 / auto-compact 第 2 次 / 上下文 ≥ 40% / 中文出错别字). Symptoms: about to hand off to a new window, context getting full, ending a session.
---

# qqq — 切窗复盘 + 交接 + 开新窗(全局通用)

> 全局 skill,任何项目都可 `/qqq` 触发。**项目特定锚动态读本项目的文件**(HANDOFF / CLAUDE / plan),不写死某个项目。

## Overview

切窗 = 一套**仪式**:① **诚实复盘**本会话(做得好 + **做得不好** + 提炼教训并落地)② 归档会话记录(当天一份、多窗汇总)③ 更新本项目交接文件 ④ 生成开场词 ⑤ commit+push ⑥ **开预填的新 Claude Code 标签页**。

**核心原则**:复盘**诚实、反谄媚**——「做得不好的」是必填项;教训不落到某个文件 = 白复盘。

> **能 / 不能**:复盘 + 更新交接文件 + **用 `vscode://anthropic.claude-code/open?prompt=…` 深链接开新 Claude Code 标签页并预填开场词** —— **能**(2026-06-04 实测)。**唯一手动剩一步:在新标签页按回车**(预填不自动发送 = Anthropic 设计限制)。pbcopy 进剪贴板 **不可靠**(agent Bash 够不到真 GUI 剪贴板),不用。

## When to Use

**MUST 跑**:触发词全集见 frontmatter description(触发层唯一权威,此处不重抄);上下文 ≥ 40% 该跑、**≥ 70% 立即**。
**不要用**:会话中途、没有切窗意图。

## 开场先认项目(全局 skill 必做)

读本项目根的 `CLAUDE.md`(若有)→ 认它的:交接文件(`HANDOFF.md` 或等价)/ 切窗约定 / push 习惯(remote+分支)/ 决策文件(`decisions.md` 等)/ 执行追踪 skill。**后续各步锚这些项目本地约定**,不假设结构。

**接着查本仓是否落后 origin**:`git fetch origin` + `git log --oneline HEAD..@{upstream}`,输出非空 = 本仓落后(多为另一窗 / 另一份 clone 所推)→ **停手报告用户**,确认后仅 `git pull --ff-only` 追平再动 HANDOFF;已分叉或有未提交改动 → 停手问用户,禁自动 rebase / merge(rebase 本就是红线)。(2026-06-25 / 07-07 实发:另一窗把 qqq 推到 0.8.1,本地 dev 仓停 0.8.0 十余天靠人肉才发现;reflog 可考 06-12、06-25 已各追平过一次,过二踩闸升格)

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
- **🎓 提炼教训 + 路由** —— 每条教训**必指定落地处**(否则白复盘):一次性状态 → 项目交接文件;可复用纪律 → 对应 skill(细节进步骤正文,Red Flags 只加一行指针);项目规范 → 项目 CLAUDE.md;业务决策 → 项目决策文件(用户拍板);**跨项目且与任何 skill 无关的个人工程纪律 → `~/.claude/CLAUDE.md`**(全局规范,需用户拍板)。**本次确无可复用教训 → 明写「无教训 + 理由」**,禁止为凑数编教训(和谄媚同罪:既不许假装完美,也不许硬编问题)
- **路由前先查重(再踩升格闸)** —— 教训想标「暂不进 skill,再踩升格」前,先扫历史教训:`[ -d docs/sessions ] && grep -n "🎓" docs/sessions/*.md || echo "(无历史 sessions,视同首踩)"`(项目 CLAUDE.md 声明了别的归档位置就扫那个;「不留 sessions」的项目此闸不适用):**同类教训已出现过 = 这就是第二次踩 = 当场升格**进对应 skill / 项目 CLAUDE.md,不许再欠;「再踩升格」只许欠一次。全局通用的纪律(如 git / 多窗类)→ 升格进本 skill,别因嫌麻烦把全局教训堆在项目 session 文件里

**升格操作链(教训要进本 skill 时,五步走全;qqq 是 plugin,只改文件不发版 = 谁也拿不到)**:① 改 `qqq-plugin/skills/qqq/` → ② **同步 bump `.claude-plugin/plugin.json` + `marketplace.json` 双版本** —— version 是 Claude Code 的更新缓存键,不 bump 光推 commit,跑 update 也拿不到新文件 → ③ `git -C <qqq-plugin 绝对路径>` 就地 commit+push(不离开当前项目工作树,呼应防线第 5 条)→ ④ **本机跑 README〈更新〉两条命令 + 重开窗口**,否则本机下窗仍跑旧版(2026-06-25 / 07-07 实发:已装插件停旧版十余天)→ ⑤ 通知同事跑同两条命令。

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

把"**停在哪 / 下一步 / 待决**"写进本项目的 HANDOFF(或等价文件);交接文件不存在(裸项目首跑)→ 先新建骨架(§1 当前状态 / §2 下一步 / §3 待决)再写。**HANDOFF = 前瞻指针,不是日志**:
- **写入门(治本)**:只收「还没做的」—— 当前状态 / 下一步 / 待决。一条内容只要能用「已完成」描述(✅ / commit SHA / 测试数 / 已合 PR# / 日期事件)= 历史 → 落 Step 2 的 docs/sessions,**禁进 HANDOFF**
- **更新 = 替换不是追加**:每次切窗先删掉上窗已变历史的项(✅完成的下一步、已落地的待决),再写新的下一步;HANDOFF 永远只有「现在朝前看」那一层、不积累
- **尺寸只作烟雾报警**:更新后 `wc -c HANDOFF.md` 扫一眼,异常大(经验阈值如 >20KB 或单段 >800 字符)= 历史又漏进来了的信号 → 回写入门清一遍,**而不是「删到塞得下」**;行数 / 字符数本身不是规矩,内容性质才是
- 逐任务执行态若项目有专门追踪机制(如 `docs/plans/<track>/`)就放那、别堆进交接散文

### Step 4 — 生成下窗开场词

> **原则:开场词 = 指针不是容器,状态只活在 HANDOFF,开场词只指过去。**

用 [assets/handoff-prompt-template.md](assets/handoff-prompt-template.md):**逐槽匹配模板,槽外内容一律不进**;禁抄什么的细节以模板〈填写要点〉为唯一权威,不在此重抄。三件套缺一不合格:① 读什么(指针)② 当前状态(硬性 1-2 句:最新落点 + 指 HANDOFF §1)③ 下一步选项(让下窗跟用户确认)。

硬约束:
- **第一行必须是带日期时间的中文主题锚**:`🪟 <YYYY-MM-DD HH:MM> 开窗 · 接 <项目> · 本窗:<中文主题一句>`,否则不合格 —— 新窗第一屏是英文 claude-mem 上下文,James 靠这行一眼认出何时开窗、干什么。时间取 **Step 4 生成当刻** `date '+%Y-%m-%d %H:%M'`(文件名 `<HHMM>` 复用同一时刻 `date +%H%M`);主题句 = 新窗要干的事(下一步),别把「当前状态」抄进锚行
- **指针之外只额外承载两样**:① 本窗新教训(一句)② 待决(一句)
- **软上限 ≤1KB / ≤25 行**:超了 = 在抄 HANDOFF/CLAUDE 已有内容,删到只剩指针

写进 **`/tmp/qqq-handoff-<项目名>-<HHMM>.txt`**(`<项目名>` = 项目根目录名,如 `tops`;`<HHMM>` = 写入当刻时分,`date +%H%M`)——项目名防两窗两项目互覆,**时分防同项目两窗同时切窗互覆**。

### Step 5 — commit + push

交接文件 / skill / 规范改动 commit → push 到本项目对应 remote+分支(commit 数 ≥ 5 给简短列表;**删除 / force / schema 迁移 / 密钥等红线操作先问用户**)。纪律:
- **add 前先 `git branch --show-current` 复认分支 + 只 add 指定路径(禁 `-A`)**(详〈多窗并行防线〉);**`git add` 后必 `git diff --name-only` 确认暂存到位再 commit**:别把已删/不存在路径塞进 `git add`(整个 add 会中止 → 内容漏提)
- **多行 commit message:Write 临时文件 → `git commit -F <临时文件>`,禁 `-F -` 喂 stdin、禁 heredoc** —— ① 喂 stdin 跨子命令行为不一致 ② commit 前 hook/guard 看整条命令串,heredoc body 里的命令字样(vitest / prisma / rm 等)被误拦 exit 非 0(2026-06-13 三踩升格兑现)
- **push 前 `git fetch` 复认不落后**(呼应〈开场先认项目〉落后检查;落后 → 停手问用户);push 后 `git show HEAD:<file>` 核对真有改动,别 push 半截
- 本次改动若落在 qqq 本体 → push 后按 Step 1〈升格操作链〉④⑤ 走:本机同步 + 重开窗提示,再通知同事

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
  # 降级短指针锚行与 Step 4 规范同构(James 此时看到的是短指针本身,不是文件内容);date / $HANDOFF 由 shell 展开,<项目>/<主题> 助手写死填入(同写死文件名)
  PROMPT=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "🪟 $(date '+%Y-%m-%d %H:%M') 开窗 · 接 <项目> · 本窗:<中文主题一句>。先读 $HANDOFF 全文(读什么 / 当前状态 / 下一步都在里面),照它开场,再跟我确认走哪条;该文件若已不存在(/tmp 重启即清),改读本项目 HANDOFF §1 + docs/sessions/<今天>.md 扫 ⚠️🎓。")
fi
URL="vscode://anthropic.claude-code/open?prompt=${PROMPT}"

case "$(uname -s)" in                 # 跨平台开链接(原来只写死 macOS open;报 bug 的同事在 Windows)
  Darwin) open "$URL" ;;
  Linux)  xdg-open "$URL" ;;
  *)      cmd //c start "" "$URL" ;;  # Windows(Git Bash/MSYS:MINGW*/MSYS*/CYGWIN*)
esac
```
> ⚠️ Step 6 用 **Step 4 实际写入的确切文件名**(刚写的,对话上下文里有,直接写死进命令);bash 调用间环境变量不保留,别指望跨步骤传变量。万一丢了:`ls -t /tmp/qqq-handoff-<项目名>-*.txt | head -1`(`<项目名>` 同上文写死填入,禁 `$(basename "$PWD")` —— 防线第 5 条禁靠继承 cwd;同项目双窗同时切窗时,确认时分是自己那份)。
> ⚠️ 降级到短指针那条**依赖 handoff 文件自包含**(Step 4 已要求);文件不自包含时降级 = 下窗读到残篇,所以 Step 4 的「读什么 / 当前状态 / 下一步」三件套是硬约束。
> 验证状态:macOS 实测 ✓(2026-06-04);Windows / Linux 分支 2026-06-14 依事故报告推导、**待真机回归**(请当初报 bug 的 Windows 同事装新版跑一次完整切窗即可销此注)。

然后一句话收尾:**新标签页已开、开场词应已预填 —— 直接按回车;万一预填是空的说一声,我把开场词贴出来**(仍是陈述,不反问"开了没 / 对不对");若走了降级分支,顺带说一句「这次 handoff 较长,新窗预填的是『去读 /tmp 那份』,按回车它会自己读」。
> 兜底:深链接万一失败(扩展版本差异等;URI 过长已由长度闸自动降级,不再是失败因)→ 把开场词作可粘贴 block 贴出来,手动 New Conversation 粘贴。

## Red Flags(自检)

> 维护纪律:新教训的细节(事故日期 / 原理 / 补救)进对应步骤正文,这里**只加一行「症状 → 回哪」**,不双写。

**复盘 / 归档**
- 切窗只更新交接文件、跳过复盘 → 违 Step 1
- 复盘只列"做得好的" / "很完美"敷衍 → 谄媚,回 Step 1 补 ≥ 1 条真问题
- 教训写空泛、不路由 → 白复盘,回 Step 1
- 没真教训却硬编一条凑数 → 和谄媚同罪,回 Step 1(明写「无教训 + 理由」)
- 标「暂不进,再踩升格」却没扫历史教训 → 升格闸空转,回 Step 1 查重
- 会话记录当天另起新文件 / 覆盖别窗条目 → 回 Step 2(同一份、只追加)
- 会话记录存逐字全文 → 噪音,回 Step 2(纪要 + 关键原话 + 复盘)

**HANDOFF**
- 写进已完成的事(✅ / SHA / 测试数 / 已合 PR#)→ 违 Step 3 写入门,历史归 docs/sessions
- 越摞越长 / 单段膨成巨段 → 症状不是病,回 Step 3 按写入门删历史,不是压缩措辞

**开场词**
- 缺"读什么 / 当前状态 / 下一步"任一 → 下窗接不上,回 Step 4 三件套
- 第一行缺日期时间 / 缺中文主题锚(降级短指针同样)→ 违 Step 4 锚行
- 内联抄 HANDOFF §1/§2 / 贴 commit hash 流水账 / 重贴 CLAUDE 红线 → 违「指针不是容器」,回 Step 4 + 模板〈填写要点〉
- 每窗往「当前状态」append 自己的里程碑 → 双份维护会漂,回 Step 4(状态只活在 HANDOFF)

**git**
- 切窗起手 / push 前没 fetch 查落后 → 回〈开场先认项目〉 / Step 5
- add 前没复认分支 / 用了 `git add -A` → 回〈多窗并行防线〉1-2
- add 带了已删路径 / add 后没验暂存 / push 后没核对 HEAD → 回 Step 5
- 交接文件没 push 就切窗 → 下窗 pull 不到,回 Step 5
- worktree 并存下 pnpm / git 靠继承 cwd → 回〈多窗并行防线〉5
- 多行 commit message 用 `-F -` / heredoc → 回 Step 5(Write 临时文件 + `-F <文件>`)

**深链接**
- 不卡 encoded 长度 / 按「原始字数」估长度 → 回 Step 6 长度闸(按 `${#ENC}` 卡 ≤1900)
- 写死 macOS `open` → 回 Step 6 `uname -s` 分支
- 深链接失败没给兜底粘贴 block → 回 Step 6 兜底

## 单一真理源

- 切窗交接落点:本项目的 HANDOFF(或等价文件)
- 会话记录归档:本项目 `docs/sessions/YYYY-MM-DD.md`(**当天一份、多窗汇总**;或项目 CLAUDE.md 声明的位置)
- 深链接法 port 自:`yeehang2026/.claude/commands/handoff.md` 的 `/handoff`
- 项目特定增强(如 TOPS):项目本地 CLAUDE.md §切窗信号 + 项目执行追踪 skill(如 tops-phase-tracking)
