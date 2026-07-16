# qqq · Claude Code 切窗复盘交接

一个用于结束当前会话、把工作可靠交给下一窗口的 Claude Code plugin。

## 核心流程

1. 诚实复盘：做得好、做得不好、教训与去向。
2. 归档本窗：默认追加到 `docs/sessions/YYYY-MM-DD.md`。
3. 更新交接：HANDOFF 只保留当前状态、下一步和待决。
4. 生成并验证下窗开场词。
5. 在授权范围内精确 commit / push。
6. 用 VS Code 深链接打开预填的新 Claude Code 标签页。

## 调用方式

安装成 plugin 后，官方命名空间命令是：

```text
/qqq:qqq
```

直接发送纯文本 `qqq` 也会触发完整收尾。其他交接类自然语言只进入无 Git 副作用的 `handoff` 模式。

| 调用 | 行为 |
|---|---|
| `/qqq:qqq preview` | 只读预览拟修改文件和开场词 |
| `/qqq:qqq handoff` | 复盘、归档、HANDOFF、开场词；不提交、不推送、不开窗 |
| `/qqq:qqq no-push` | 可本地提交，不推送；可开新窗 |
| `/qqq:qqq`、`/qqq:qqq full` 或纯文本 `qqq` | 完整仪式；仍受项目规则和活跃 no-push 指令约束 |

可以在模式后追加下窗主题，例如：

```text
/qqq:qqq no-push 修复支付回调测试
```

## 安装

仓库公开，无需 GitHub 凭证：

```bash
claude plugin marketplace add jameshcb/qqq
claude plugin install qqq@jameshcb
```

安装后运行 `/reload-plugins`；若当前宿主不支持热重载，重开 Claude Code。

## 更新

```bash
claude plugin marketplace update jameshcb
claude plugin update qqq@jameshcb
```

然后运行 `/reload-plugins` 或重开 Claude Code。

## 设计要点

- 安全模式先行：普通“帮我写交接”不会隐式 commit、push 或开新窗口。
- 并发友好：记录进入 qqq 前的 Git 基线，不接管其他窗口已有的 dirty 文件。
- 指针式交接：开场词不复制整份 HANDOFF，只告诉下一窗口读什么、停在哪、选哪一步。
- 可机械验证：`validate-handoff.mjs` 检查锚行和三件套；`open-handoff.mjs` 统一处理 encoded URL 长度和跨平台打开。
- 环境降级：没有 Git、remote 或 VS Code 深链接时仍完成可安全完成的部分，并明确报告跳过项。

## 仓库结构

```text
qqq/
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── skills/qqq/
│   ├── SKILL.md
│   ├── assets/handoff-prompt-template.md
│   ├── references/git-safety.md
│   ├── scripts/
│   │   ├── open-handoff.mjs
│   │   └── validate-handoff.mjs
│   └── evals/evals.json
└── CHANGELOG.md
```

## 开发验证

```bash
claude plugin validate . --strict
node skills/qqq/scripts/validate-handoff.mjs /tmp/qqq-test-handoff.txt
node skills/qqq/scripts/open-handoff.mjs \
  --file /tmp/qqq-test-handoff.txt \
  --project test \
  --topic 测试 \
  --dry-run
```

发布版使用 `.claude-plugin/plugin.json` 的语义化版本作为更新缓存键。`marketplace.json` 的 `metadata.version` 仅用于市场元数据展示，不是插件缓存键。
