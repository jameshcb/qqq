# Changelog

## 1.6.0

背景：2026-09-01 James 拍板 —— 知识库的 per-deploy 义务移到项目侧（部署流程自带），qqq 降为**窗级兜底核对**；通用插件不该认得某一个项目的目录，表态要落盘可验，副作用要有回执。

- **项目声明契约**：删掉 SKILL 里的 TOPS 硬编码（§3 两处「如 TOPS = `docs/governance/claude-md-incidents.md` / `docs/training/`」），改为读项目根 `CLAUDE.md` 的「## qqq 项目声明」段（每行 `- key: value`，键 `help_dir` / `help_generators` / `incident_archive` / `sessions_dir` / `handoff` / `backlog` / `finish_script`）。新增 `scripts/project-declaration.mjs` 解析并输出 JSON `{found, root, declaration}`；无 `CLAUDE.md` 或无该段 = 降级不是失败（`found:false`、exit 0），缺某键按各节默认行为（sessions 仍默认 `docs/sessions/`，无 `incident_archive` 仍整段进 `CLAUDE.md`）。契约与样例只写在 README「qqq 项目声明」一处，SKILL §2 第 1 条先跑脚本、§3/§4/§5/§7 改引键名。
- **「有/无」表态与版本落盘可验**：§4 sessions section 固定两行 `帮助/FAQ: 有 <文件路径>（<编号>）` 或 `帮助/FAQ: 无（<一句理由>）`，以及 `qqq 版本: <runningVersion>`（version-check 报落后时写 `qqq 版本: X.Y.Z（落后，marketplace=Y.Y.Y，缺:<一句>）`；runningVersion 为 null 的开发态写 `未知（<原因>）`）。新增 `scripts/validate-session.mjs`：取文件里最后一个 `## HH:MM ·` section 核这两行，缺一项 exit 1 并逐条说明；`preview` 不跑。§9 回报改为原样复述这两行。此前 1.4.0 / 1.5.0 只要求「回报里说」，说没说无从机械核。
- **副作用回执**：§9 固定一行 `commit ✓ <sha> | ✗（原因） / push ✓ | ✗（原因） / 开窗 ✓ | ✗（原因）`；§8 末尾要求开窗脚本失败或仪式没执行到这一步时显式说「本次未开新窗」（2026-08-19 实发：仪式跑一半没开窗，用户肉眼才发现）。
- 三处小修：① 模板「1KB」口径改成与 `validate-handoff.mjs` 一致的分档（CJK 1536B / 拉丁 1024B）；② 凭据正则 `(ghp|github_pat|sk)-` 要求连字符，`ghp_` / `github_pat_` 恒不命中（实测 false），改为真实前缀 `ghp_` / `github_pat_` / `sk-` 并加左边界防 `desk-…` 类英文连字词误报；③ SKILL 瘦身 154 → 104 行 —— §3 两问 + 构建生成物下沉 `references/knowledge-routing.md`，§5 四段事故叙事（分段读者 / 整类清 / 闸拦后 index 分叉 / 台账划掉）下沉 `references/handoff-hygiene.md`，正文各留一行判据 + 链接；§2 version-check 动机压成一行（脚本头注已有）。
- evals 1 / 2 / 3 / 5 补两行固定格式、回执与「本次未开新窗」的期望；README 补「qqq 项目声明」节、仓库结构与开发验证命令。
- `references/model-effort.md` 判定表默认档改为 `/model opus` + `/effort high`（2026-09-01 James 拍全局默认 Opus + high；此前表里写 sonnet + high，而 settings 实配从未是它）。仓规范「必跑验证」段补齐五个脚本与 `project-declaration` / `validate-session` 样本。

## 1.5.0

- SKILL §3 路由原则新增一档:**别人照着做的操作口径 → 项目的帮助 / FAQ 内容**(项目声明的位置,如 TOPS = `docs/training/`),并要求**显式写「有」或「无」**(同「无可复用教训」姿势)。背景:2026-08-29 James 拍「同步生成知识库」—— 此前帮助内容全靠临时想起来写,界面改了而帮助停在旧写法无人发现。<br>配两条落笔前必答:① **读者是谁、载体有没有权限门** —— 喂 AI 答疑的语料通常整份进 prompt 且零角色过滤,写进去 = 全员可读,成本/供应商/底价类须另走带门的载体(TOPS 实撞:FAQ 语料门 = 任何登录用户,而销售/业务员有意不给 `supplier.read`);② **常青口径 vs 会过期的快照** —— 条数、金额、「目前有 N 个」进 sessions 不进帮助。<br>另记一条机制坑:帮助内容有**构建期生成物**时(打包进 bundle 的语料常量),改完要重跑生成器并提交生成物,否则同步测试红或线上仍是旧内容。
- SKILL §9 最终回报增加「帮助 / FAQ 本窗有没有新增或更新」——让用户当场看出知识库跟没跟上。

## 1.4.1

- SKILL §3 路由原则「本项目规范 → 项目 `CLAUDE.md`」收紧为**只进一行判据**：事故叙事全文进项目声明的事故档案（如 TOPS = `docs/governance/claude-md-incidents.md`，C-NN 编号），同族再踩只追加档案、不动 `CLAUDE.md` 正文；无档案约定的项目才整段进 `CLAUDE.md`。背景：原路由无形态要求，TOPS CLAUDE.md 2026-07-13 瘦身（30KB→11.3KB）后经切窗升格叙事回流，三周半反弹到 57KB（§14 单节占 74%），2026-08-07 第二轮瘦身（→20.6KB）时 James 拍此收紧，治的是入口不是存量。

## 1.4.0

- 开场词字节软上限**按内容语言分档**：CJK 1536B（≈512 汉字）/ 拉丁 1024B，`validate-handoff.mjs` 按内容自动判。原先拿英文口径量中文 = 只给 ~340 字，而模板强制的五段（先读/当前状态/下一步/模型/纪律）根本塞不进 —— 恒警告等于让警告变噪音（2026-07-30 实发：中文开场词压三轮 1302→1262→1155B 仍超，只好带着 warning 交付）。英文口径不受影响，不因此被带松。
- 新增 `scripts/version-check.mjs` + SKILL §2 第 5 条：开场核一次 qqq 自身版本。会话加载的是 `plugins/cache/<owner>/qqq/<version>/` 那一份，别的机器发了版、或本机 pull 了仓却没 `claude plugin update`，当前会话照旧跑旧版且**无任何提示**（2026-07-30 实发：整套仪式跑在 1.1.0 上而远端已 1.3.0，三笔改进一条没生效，其中一笔恰好就是当时踩的坑）。落后只提示不自动改安装；离线自行降级。
- SKILL §9 最终回报增加「本次跑的 qqq 版本号」——让用户当场看出仪式是不是过期版本跑的，不必等下次才发现。

## 1.3.0

- `references/git-safety.md` 增加「push 被拒之后：先算真冲突面」：算对方改了哪些文件必须从 merge-base 起，禁裸 `HEAD..origin/main`（裸写把自己的新增当成对方改的，读出「全部文件冲突」甚至「对方独立做了同款功能」）。三窗三踩（2026-06-19 / 06-20 / 07-11）。
- `references/git-safety.md` 增加「解冲突：先读对方那侧写了什么」：禁 `-X ours|theirs` 强解、禁按「哪边是我写的」取舍；收尾脚本的兜底 merge 遇冲突必须停下报文件名，不许自动强解或 `--abort`（TOPS 2026-07-10 实发，该设计挡住了「整文件重写吞掉用户当窗三条决策」）。
- 说明：这两条原为 0.9.1 / 0.9.2 落在本地另一份克隆里，未随 07-16 远端历史重建带过来，本次按新结构补回 reference（原提交 `41a9d14` / `41efd15` 与当前历史无共同祖先，故未走 cherry-pick）。

## 1.2.0

- §5 增加「提交被闸拦下后，下次 commit 前对一眼 `git diff --cached --name-only` 与 `git diff --name-only`」：hook 拦住 commit 不回滚暂存区，index 与工作区就此分叉；两个方向都已实发 —— 多提（TOPS 2026-07-26，拦下时 staged 的 4 个文件被下一笔卷走）与漏提（TOPS 2026-07-30，拦下后又编辑，再提交提的仍是旧版，推上去仍超闸）。
- §5 增加「本窗做完的活回前瞻台账划掉」：台账里躺着的条目会被下窗当成没做直接开工（TOPS 2026-07-30 一窗逮到两条当天做完没回写的条目，而台账表头本就写着这条流程）。

## 1.1.1

- §5 增加「写给谁就写进谁读的那一段」：交接文件按角色/机器分段时，要对方做的事写进对方读的那段；提了请求但对方任务段没条目 = 没通知到（TOPS 2026-07-25 实发，二踩升格）。
- §5 增加尺寸报警后的整类清判据：清完余量很小 = 只清了自己刚加的那点，下窗必再超标；判据是逐段问「这段能不能用『已完成』开头」（同族二踩：前窗净增 745 B 当待决交出，下窗仍只清自己那点、余量 238 B）。

## 1.1.0

- 开场词新增「模型：」行：收尾时按下窗主题判定下窗建议的模型与 effort（判定表在 `references/model-effort.md`，含定价快照与省配额顺序）。
- `validate-handoff.mjs` 对缺失模型行给软警告（不报错，旧格式仍有效）。
- eval 2 增加模型建议行期望。

## 1.0.0

- 增加 `preview`、`handoff`、`no-push`、`full` 四种模式，分离交接文案与 Git/开窗副作用。
- 修正 plugin skill 的正式调用名为 `/qqq:qqq`，保留纯文本 `qqq` 快捷触发。
- 将 Git 并发与发版细节移到按需读取的 reference，缩短主 skill。
- 新增 handoff 格式验证和跨平台深链接脚本。
- 增加非 Git、无 remote、并发 dirty 文件和活跃 no-push 的降级规则。
- 修正版本说明：插件更新缓存键来自 `plugin.json`，不是 marketplace 的 metadata version。
- 新增覆盖六类关键场景的 eval 集。

## 0.9.1

- 增加 no-push 闸、并发改动防线和项目收尾脚本分流。
