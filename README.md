# qqq · Claude Code 切窗复盘交接

一个用于结束当前会话、把工作可靠交给下一窗口的 Claude Code plugin。

## 核心流程

1. 诚实复盘：做得好、做得不好、教训与去向。
2. 归档本窗：默认追加到 `docs/sessions/YYYY-MM-DD.md`（项目声明了 `sessions_dir` 时服从声明），section 末尾固定两行「帮助/FAQ: 有/无」与「qqq 版本:」表态，`validate-session.mjs` 机械核。
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

## qqq 项目声明

qqq 是通用插件，不写死任何项目的目录。项目要让 qqq 知道帮助真源、事故档案、sessions 等在哪，就在项目根 `CLAUDE.md` 里加一个二级标题段：标题固定为 `## qqq 项目声明`，段内每行形如 `- key: value`（半角冒号后一个空格），直到下一个标题为止。键名固定小写下划线；value 里的路径相对项目根，不加反引号或引号。两侧必须一字不差用同一格式。

```markdown
## qqq 项目声明

- help_dir: docs/help/
- help_generators: npm run build:help && npm test -- help
- incident_archive: docs/incidents.md
- sessions_dir: docs/sessions/
- handoff: HANDOFF.md
- backlog: BACKLOG.md
- finish_script: scripts/finish.sh
```

以上 value 只是示例，按项目实际填。缺某键 = 该项目没有该约定，qqq 按下表降级：

| 键 | 含义 | 缺失时 qqq 的行为 |
|---|---|---|
| `help_dir` | 帮助 / FAQ 真源目录 | 视为项目无帮助约定；§4 表态写「无（项目未声明 help_dir）」 |
| `help_generators` | 改完帮助 md 后要重跑的命令，可用 `&&` 连接 | 不跑生成器 |
| `incident_archive` | 事故档案文件 | 事故叙事整段写进 `CLAUDE.md` |
| `sessions_dir` | 会话归档目录 | `docs/sessions/` |
| `handoff` | 交接文件 | `HANDOFF.md` 或等价文件；没有则新建最小三段骨架 |
| `backlog` | 前瞻台账 | 跳过「划掉已完成条目」并在回报里说明 |
| `finish_script` | 收尾脚本（可选，没有就不写这行） | 按 SKILL §7 手工步骤 |

解析由 `skills/qqq/scripts/project-declaration.mjs` 完成：`node skills/qqq/scripts/project-declaration.mjs --root <项目根>`（默认 cwd），stdout 输出 `{found, root, declaration}`；找不到 `CLAUDE.md` 或没有该段是降级不是失败（`found:false`、exit 0）。

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
- 可机械验证：`validate-handoff.mjs` 检查锚行和三件套；`validate-session.mjs` 检查归档 section 的两行表态；`open-handoff.mjs` 统一处理 encoded URL 长度和跨平台打开。
- 项目声明契约：项目目录（帮助真源、事故档案、sessions、台账、收尾脚本）由项目 `CLAUDE.md` 的「qqq 项目声明」段提供，插件本身不认得任何具体项目。
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
│   ├── references/
│   │   ├── git-safety.md
│   │   ├── handoff-hygiene.md
│   │   ├── knowledge-routing.md
│   │   └── model-effort.md
│   ├── scripts/
│   │   ├── open-handoff.mjs
│   │   ├── project-declaration.mjs
│   │   ├── validate-handoff.mjs
│   │   ├── validate-session.mjs
│   │   └── version-check.mjs
│   └── evals/evals.json
└── CHANGELOG.md
```

## 开发验证

```bash
claude plugin validate . --strict
for f in skills/qqq/scripts/*.mjs; do node --check "$f"; done
node skills/qqq/scripts/validate-handoff.mjs /tmp/qqq-test-handoff.txt
node skills/qqq/scripts/open-handoff.mjs \
  --file /tmp/qqq-test-handoff.txt \
  --project test \
  --topic 测试 \
  --dry-run
node skills/qqq/scripts/project-declaration.mjs --root .        # 本仓无声明，期望 found:false、exit 0
node skills/qqq/scripts/validate-session.mjs /tmp/qqq-test-session.md
```

发布版使用 `.claude-plugin/plugin.json` 的语义化版本作为更新缓存键。`marketplace.json` 的 `metadata.version` 仅用于市场元数据展示，不是插件缓存键。
