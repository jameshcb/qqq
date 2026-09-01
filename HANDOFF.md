# HANDOFF · qqq

只写「现在朝前看」。已完成的经过在 `docs/sessions/`。

## 当前状态

1.6.0 已发布并推到 GitHub(`817a8a7`),本机插件已 `claude plugin update` 到 1.6.0 并生效(本窗 runningVersion=1.6.0)。工作树与 `origin/main` 同步。本仓**有意不加**「## qqq 项目声明」段:默认值(`docs/sessions/` + `HANDOFF.md`)恰好正确,且 README 第 132 行拿本仓当 `found:false` 的活样本。

## 下一步

- **优先级最高的活不在本仓**:TOPS 的「memory ↔ 常驻规则对账」(改被推翻的旧规则、只退已完整固化的索引条目)—— 开 TOPS 窗,指针 = TOPS memory `todo-memory-resident-reconcile`。
- `version-check.mjs` 开发态(直跑仓库)`runningVersion=null`,只能靠「qqq 版本: 未知(…)」式过 `validate-session`。可让它回退读自身旁的 `.claude-plugin/plugin.json`。
- `preflight.sh` 两条新拒批分支(工作树≠origin/main 的「判不出」、sync 红)只验了绿路径,阴性样本要改 `docs/training/` 或生成物才能造 —— 下次真动帮助内容时顺手验。
- `deploy.sh` 的「生成物过期 → 警告 + `git checkout --` 还原」分支从未在生产真跑过;首次真实部署时 `grep -nE "fatal|error|✗|⚠️"` 全量输出看它。
- TOPS `scripts/qqq-sync.sh` 兜底段盲点:merge 因工作树脏被 git **拒绝启动**时 `--diff-filter=U` 为空,脚本当「merge 干净」继续跑 type-check + push。判 merge 自己的退出码即可。

## 待决

- **settings.json 默认要不要带 `[1m]`**:本窗末尾 James 手动 `/model opus[1m]`,而 settings 默认是不带后缀的 `claude-opus-5`。若每窗都要 1M,把默认改成 `claude-opus-5[1m]`;若只是本窗需要,维持现状。
- TOPS `apps/web` 的 `e2e:serve` 仍是裸 `next build && next start`(不跑两个生成器),有意没动:它只服务 e2e、生成物由 sync 测试守。要不要同样串联,待 James 拍。
