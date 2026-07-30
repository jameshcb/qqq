# Git 安全与 qqq 发版

仅在 SKILL 的 Git 收尾或 qqq 本体发版步骤中读取。

## 开始时建立基线

在项目根上显式运行 Git，不依赖上一条命令留下的 cwd：

```bash
git -C "<项目根>" branch --show-current
git -C "<项目根>" rev-parse HEAD
git -C "<项目根>" status --short
git -C "<项目根>" remote -v
```

有 upstream 时：

```bash
git -C "<项目根>" fetch origin
git -C "<项目根>" rev-list --left-right --count HEAD...@{upstream}
```

- behind > 0：停止 Git 写操作，报告用户；只有用户同意且能 fast-forward 时才 `pull --ff-only`。
- ahead、behind 都 > 0：已分叉，不自动 merge、rebase 或 reset。
- 没 upstream：可以完成本地交接；不得声称已同步远端。

## 共享工作树与并发窗口

其他窗口可能在两条命令之间切分支、提交或暂存文件。每次 add 前重新检查：

```bash
git -C "<项目根>" branch --show-current
git -C "<项目根>" status --short -- "<路径>"
```

- 分支或 HEAD 与基线不同：停止 Git 写操作。
- 文件在 qqq 开始前已 dirty：视为用户/其他窗口拥有；除非能证明 staged diff 只包含 qqq 修改，否则不自动提交。
- 使用 worktree 时，每条 git、测试和包管理命令都显式带 `-C <绝对路径>`。
- 不用 `git add .`、`git add -A`、`git commit -a`。
- 不用 reset、checkout、restore 去“清理”未知改动。

## 精确暂存与核对

逐路径暂存，并立刻核对：

```bash
git -C "<项目根>" add -- "<路径1>" "<路径2>"
git -C "<项目根>" diff --cached --name-only
git -C "<项目根>" diff --cached
```

多行 commit message 写入临时文件，再用 `git commit -F <文件>`。commit 后：

```bash
git -C "<项目根>" show --stat --oneline HEAD
git -C "<项目根>" status --short
```

发现应提交文件缺失时，先查 `git reflog -8` 判断是否被并发窗口卷入其他 commit，不用破坏性命令补救。

## Push 闸

push 前再次 fetch 并确认 behind 为 0。以下任一条件成立就不 push：

- 模式是 `no-push` 或 `handoff`。
- 当前会话存在仍生效的 no-push、STOP、只读指令。
- 用户没有授权会改变远端的动作。
- 分支、HEAD 或 upstream 与基线不一致。
- staged/committed 内容混入了非 qqq 范围改动。

## push 被拒之后：先算真冲突面

算「对方相对共同祖先改了哪些文件」必须从 merge-base 起，禁裸 `HEAD..origin/main`。裸写会把**自己这边的新增**也列成「对方改的」，读出来是「全部文件都冲突」，甚至是「对方独立做了同款功能」：

```bash
mb=$(git -C "<项目根>" merge-base HEAD origin/main)
git -C "<项目根>" diff --name-only "$mb" origin/main
```

把这份清单与自己的改动清单 `comm -12` 取交集，那才是真冲突点。注意 `git log HEAD..origin/main`（数落后几个 commit）方向是对的，只有「算文件 diff / 算真重叠」才需要切 merge-base，别把两者混成一条纪律。

三窗三踩（2026-06-19 / 06-20 / 07-11），每次都靠停下重算救回，但每次多耗一轮。

## 解冲突：先读对方那侧写了什么

冲突标记只说「同一处两边都改了」，不说对方那侧藏着别窗刚落的新决策。

- 禁 `-X ours` / `-X theirs` 批量强解；禁只按「哪边是我写的」取舍。
- 逐块读对方内容 → 把其中的新决策 / 新事实并进自己的版本 → 再解 → `grep` 复核那些新事实没被自己的版本覆盖掉。
- 整文件重写、大段删除时最危险：文本层看像「他加了一段我正好删掉的东西」，内容层可能是「他记下了用户刚拍的三条决策」。
- 项目自备的收尾脚本（如 `qqq-sync.sh`）的兜底 merge 遇冲突必须停下报文件名，不许自动强解、不许 `--abort`，把判断交回人。这条设计在 2026-07-10 实发中挡住了「整文件重写吞掉用户当窗三条决策」。

软冲突（Git 不报，两窗并行收同一决策、语义互相矛盾）早有纪律；硬冲突（Git 报了）反而容易被只当成文本取舍，故单列。

## qqq 插件本体发版

1. 保持插件名和 skill 名不变。
2. 修改 skill 后按语义化版本更新 `.claude-plugin/plugin.json` 的 `version`。
3. `marketplace.json` 的 `metadata.version` 只是市场元数据，不是插件更新缓存键；可为可读性同步，但不要把它当成发版生效条件。不要再在 marketplace 插件条目重复声明 version。
4. 更新 `CHANGELOG.md`，并运行：

```bash
claude plugin validate "<qqq 仓库根>" --strict
node "<qqq 仓库根>/skills/qqq/scripts/validate-handoff.mjs" "<测试 handoff 文件>"
node "<qqq 仓库根>/skills/qqq/scripts/open-handoff.mjs" --file "<测试 handoff 文件>" --project test --topic 测试 --dry-run
```

5. 只有用户明确要求发布时才 commit 和 push。
6. 发布后更新已安装插件；skill 内容支持实时重载时可用 `/reload-plugins`，否则重开 Claude Code：

```bash
claude plugin marketplace update jameshcb
claude plugin update qqq@jameshcb
```
