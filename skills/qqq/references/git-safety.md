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
