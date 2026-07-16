# Changelog

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
