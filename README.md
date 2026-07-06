# qqq · 切窗复盘交接

一个 Claude Code skill 插件:每次**切窗 / 收尾 / 换窗**时跑一套交接仪式,把会话干净地交给下一个窗口。任何项目通用。

## 它做什么(`/qqq` 触发)

1. **诚实复盘**本会话 —— ✅ 做得好的 / ⚠️ 做得不好的(必填,反谄媚)/ 🎓 提炼教训并路由到落地处
2. **归档会话记录** —— 追加到本项目 `docs/sessions/<YYYY-MM-DD>.md`(当天一份、多窗汇总、只追加,默认进 git;项目 CLAUDE.md 可声明例外)
3. **更新本项目交接文件**(HANDOFF.md 或等价)—— 停在哪 / 下一步 / 待决
4. **生成下窗开场词**(指针不是容器:读什么 + 当前状态 1-2 句 + 下一步选项;状态只活在 HANDOFF,软上限 ≤1KB/≤25 行;第一行带 `🪟 日期时间 + 中文主题`,英文上下文堆里一眼定位)
5. **commit + push**(含 `git add` 暂存核对纪律)
6. **开预填的新 Claude Code 标签页** —— `vscode://anthropic.claude-code/open?prompt=…` 深链接,提示词已预填,按回车即可继续

> 深链接法 port 自 yeehang2026 的 `/handoff`;实测能开预填标签页(唯一手动:按一下回车,预填不自动发送 = Anthropic 设计限制)。
> 跨平台(macOS `open` / Linux `xdg-open` / Windows `start`);handoff 较长时(encoded URL 逼近 Windows 协议处理器 ≈2048 上限)自动降级成预填「读 /tmp 那份交接文件」短指针,长度免疫。
> ⚠️ 开新标签页这一步依赖 `vscode://` 深链接,**只在 VS Code 宿主里有效**;终端 CLI / 其他 IDE 环境走兜底:开场词以可粘贴 block 给出,手动开新会话粘贴。

## 安装(同事 / 你自己)

仓库是 public,直接装,不用任何凭证。**在终端**跑(官方 `claude` CLI,任何项目目录都行):

```bash
claude plugin marketplace add jameshcb/qqq
claude plugin install qqq@jameshcb
```

装完**重开 Claude Code 窗口**(skill 在开窗时加载),任意项目里 `/qqq` 即可触发切窗交接。

> ⚠️ **VSCode 扩展里没有 `/plugin` 斜杠命令**(那是终端 CLI 交互模式才有的)。VSCode 用户用上面的 `claude plugin …` 终端命令装即可 —— 插件装的是全局配置,CLI 和 VSCode 扩展共享同一份,装一次两边都生效。
> `claude plugin` 是较新的子命令,报 `unknown command` = 先升级 Claude Code 再装。

## 更新

```bash
claude plugin marketplace update jameshcb
claude plugin update qqq@jameshcb
```
然后重开 Claude Code 窗口。

## 仓库结构

```
qqq/
├── .claude-plugin/
│   ├── marketplace.json   ← 市场名 jameshcb,含 qqq 插件
│   └── plugin.json        ← 插件元数据
└── skills/
    └── qqq/
        ├── SKILL.md
        └── assets/handoff-prompt-template.md
```

> 改 skill 动 `skills/qqq/`,**并同步 bump `.claude-plugin/plugin.json` 和 `marketplace.json` 的版本号** —— version 是 Claude Code 的更新缓存键,不 bump 光推 commit,同事跑 update 也拿不到新文件。push 后同事按上方〈更新〉两条命令 + 重开窗口即同步(完整发版链见 SKILL.md Step 1〈升格操作链〉)。
