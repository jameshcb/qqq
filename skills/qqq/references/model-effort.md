# 下窗模型与 effort 判定

收尾生成开场词时，按「下窗主题」查此表，产出一行建议写入开场词的「模型：」行。此表是唯一数据源，SKILL 与模板不复制第二份。

## 判定表

| 下窗任务性质 | 建议（两段都照抄填入，不留占位符） |
|---|---|
| 常规开发：CRUD、表单、UI、小 bug、写文档、配置调整 | `/model sonnet` + `/effort high` |
| 纯问答、机械批量改动、整理笔记 | `/model sonnet` + `/effort low` |
| 难 bug 追踪、架构设计、跨多文件大重构、方案评审 | `/model opus` + `/effort high`；最难的写 `/effort xhigh` |
| 极难长程自主任务（整夜自主跑、超大迁移；罕见） | `/model fable` + `/effort high` |

effort 一律写显式值，不写「保持默认」——effort 设置跨会话持久，上一窗改过档位时「默认」未必是 high。判定依据是任务难度，不是项目重要性。拿不准时选 sonnet：编码与 agentic 任务上 Sonnet 5 已达前代 Opus 水准，成本按标准价约为 Opus 的 60%、Fable 的 30%（2026-08-31 前 Sonnet 优惠价下更低，约 40%/20%）。

## 产出格式

写入开场词一行（一句理由，不复制本表）：

```text
模型：建议 /model sonnet + /effort high（常规功能开发，Sonnet 足够）
```

当前窗口所用模型若与建议一致，理由可写「延续当前模型」。

## 省配额顺序

1. 先降 effort（Claude 5 家族 low/medium 表现常超上代模型高档位），再降模型。
2. `/usage` 查配额消耗按模型的分解，验证判断。
3. Sonnet 5 原生 1M 上下文，不需要 `[1m]` 后缀。

## 数据快照（2026-07-29，价格变动时更新本节）

API 定价 $/1M token（输入/输出）：Fable 5 = 10/50 · Opus 5 = 5/25 · Sonnet 5 = 3/15（2026-08-31 前优惠 2/10）· Haiku 4.5 = 1/5。订阅配额消耗速率近似同比例。effort 五档 low/medium/high/xhigh/max，Claude Code 默认 high。
