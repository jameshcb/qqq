# 下窗开场词模板

> 填好后整段进剪贴板(pbcopy)。James 新窗 Cmd+V 即可。必须自包含、可直接粘贴。

```
接 TOPS Session <N>(切窗续上)。开场按顺序读:
1. HANDOFF.md 顶部摘要 + Session <N> entry(停在哪 / 下一步 / 待决)
2. docs/decisions.md <相关 §N>(本会话主战场决策)
3. 本会话关键产出:<列具体文件路径,如 docs/plans/<track>/、docs/superpowers/specs/...>

当前状态:<一句话 —— 干净/有未推 commit/某 phase 进行中>

下一步(先跟我确认走哪条):
① <选项 A>
② <选项 B>
③ <选项 C>
```

## 填写要点

- **§N 要具体**:写 §41 不写"看 decisions";下个 Claude 才不用全文扫
- **产出文件给全路径**:可点可读
- **下一步是"选项"不是"指令"**:让下个 Claude 跟 James 确认,不替他拍板
- **当前状态报实**:有未推 commit / 半截的 phase 必须写明,别让下窗以为干净
