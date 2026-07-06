# qqq-plugin 仓库规范

Claude Code skill 插件仓库:qqq 切窗仪式(复盘 + 归档 + 交接 + 开新窗)。市场名 `jameshcb`,**公开仓库**,同事直接装。

## 结构与改动
- 改 skill 只动 `skills/qqq/`(SKILL.md + assets/);插件元数据在 `.claude-plugin/`
- **发版硬前提**:任何 skill 改动必须**同步 bump `.claude-plugin/plugin.json` + `marketplace.json` 双版本** —— version 是 Claude Code 的更新缓存键,不 bump 光推 commit,谁跑 update 都拿不到新文件(官方 plugins-reference「Version management」)
- 完整发版链见 `skills/qqq/SKILL.md` Step 1〈升格操作链〉五步:改文件 → bump 双 json → commit+push → 本机更新 + 重开窗 → 通知同事
- SKILL.md 的维护形态:新教训细节进对应步骤正文,Red Flags 只加一行「症状 → 回哪」指针,不双写

## 发版后三处同步(2026-06-25 / 07-07 实发教训)
push 只完成第一处,另两处不会自己动:
1. **origin** —— push 即达
2. **本机已装插件** —— `claude plugin marketplace update jameshcb && claude plugin update qqq@jameshcb`,再重开窗口生效
3. **同事** —— 通知跑同两条命令(见 README〈更新〉)

本仓常被多窗 / 多份 clone 改:**起手先 `git fetch` + `git log --oneline HEAD..@{upstream}` 查落后**,非空先 `git pull --ff-only` 追平再动手。

## 会话记录
切窗(`/qqq`)把会话纪要 + 复盘归档到 `docs/sessions/YYYY-MM-DD.md`(当天一份、多窗汇总、只追加,进 git)——按全局默认,本仓不例外。

## 验证(改完必跑)
- 四份文件交叉读一遍口径一致:SKILL 六步 ↔ README「它做什么」↔ 双 manifest description;锚行格式(SKILL Step 4 = Step 6 降级串 = 模板)、时间口径、触发清单单源(只活在 frontmatter)
- Step 6 代码块有改动 → 提取到临时文件 `bash -n` 验语法
- 双 manifest `jq .version` 一致
