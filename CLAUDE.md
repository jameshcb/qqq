# qqq plugin 仓库规范

这是 Claude Code 的切窗复盘交接 plugin。稳定标识均为 `qqq`，不要改插件名、skill 目录名或 frontmatter name。

## 修改原则

- `skills/qqq/SKILL.md` 只保留模式判定和主流程。
- Git 并发、发布等细节放 `skills/qqq/references/`。
- 可重复、可机械判断的逻辑放 `skills/qqq/scripts/`，不要继续堆长 shell 片段。
- 开场词口径以 `assets/handoff-prompt-template.md` 为准；SKILL 和脚本只声明约束，不复制第二份完整模板。
- 保持普通交接请求无远端副作用；push 必须同时满足模式、用户授权、项目规则和 upstream 安全条件。

## 发版

- 修改 skill 后按 SemVer 更新 `.claude-plugin/plugin.json` 的 `version`。
- `marketplace.json` 的 `metadata.version` 可同步用于展示，但不是插件缓存键；不要在插件条目重复声明 `version`。
- 更新 `CHANGELOG.md`。
- 用户没有明确要求发布时，只完成本地修改和验证，不 push。

## 必跑验证

```bash
claude plugin validate . --strict
for f in skills/qqq/scripts/*.mjs; do node --check "$f"; done
```

每条都 `cmd > log 2>&1; echo exit=$?` 读退出码。再做四组样本测试：

- `validate-handoff.mjs`：一份有效、一份无效 handoff。
- `open-handoff.mjs --dry-run`：短文本进 `full`，超长中文进 `pointer`。
- `project-declaration.mjs`：对本仓跑得到 `found:false` 且 exit 0；对一个含「## qqq 项目声明」段的项目根跑得到 `found:true` 且键值完整。
- `validate-session.mjs`：含「帮助/FAQ」「qqq 版本」两行的样本 exit 0，缺任一行的样本 exit 1。

最后交叉检查：

- SKILL 模式表与 README 一致。
- 插件安装后的命令写作 `/qqq:qqq`。
- `plugin.json` 与 CHANGELOG 版本一致。
- evals 覆盖 full、handoff、preview、no-push、非 Git 和并发 dirty 文件。
