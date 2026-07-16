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
node --check skills/qqq/scripts/validate-handoff.mjs
node --check skills/qqq/scripts/open-handoff.mjs
```

再使用一份有效和一份无效 handoff 测试 validator，并对短文本、超长中文文本各跑一次 `open-handoff.mjs --dry-run`，确认分别进入 `full` 和 `pointer` 模式。

最后交叉检查：

- SKILL 模式表与 README 一致。
- 插件安装后的命令写作 `/qqq:qqq`。
- `plugin.json` 与 CHANGELOG 版本一致。
- evals 覆盖 full、handoff、preview、no-push、非 Git 和并发 dirty 文件。
