# qqq · 切窗复盘交接

一个 Claude Code skill 插件:每次**切窗 / 收尾 / 换窗**时跑一套交接仪式,把会话干净地交给下一个窗口。任何项目通用。

## 它做什么(`/qqq` 触发)

1. **诚实复盘**本会话 —— ✅ 做得好的 / ⚠️ 做得不好的(必填,反谄媚)/ 🎓 提炼教训并路由到落地处
2. **更新本项目交接文件**(HANDOFF.md 或等价)—— 停在哪 / 下一步 / 待决
3. **生成下窗开场词**(自包含:读什么 + 当前状态 + 下一步选项)
4. **commit + push**(含 `git add` 暂存核对纪律)
5. **开预填的新 Claude Code 标签页** —— `vscode://anthropic.claude-code/open?prompt=…` 深链接,提示词已预填,按回车即可继续

> 深链接法 port 自 yeehang2026 的 `/handoff`;实测能开预填标签页(唯一手动:按一下回车,预填不自动发送 = Anthropic 设计限制)。

## 安装(同事 / 你自己)

> 前提:Claude 已登录 GitHub、有权访问 `jameshcb/qqq` 仓库。

```
/plugin marketplace add jameshcb/qqq
/plugin install qqq@jameshcb
/reload-plugins
```

装完任意项目里 `/qqq` 即可触发切窗交接。

## 更新

```
/plugin marketplace update jameshcb
/reload-plugins
```

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

> 改 skill 只改 `skills/qqq/`,push 后同事 `/plugin marketplace update` 即同步。
