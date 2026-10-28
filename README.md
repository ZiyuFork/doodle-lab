# 涂鸦进化室 · Doodle Lab

随机底稿 → 用户添几笔 → 线条顺滑 → 闭合区域上色。DeepSeek 可分析当前草稿并返回配色方案，由网页绘制；不会冒充图片生成模型。

## 已有功能
- 八类底稿：小猫、蘑菇屋、小怪兽、小鱼、花、火箭、小鸟、茶杯。形状比例、位置和情境带随机变化。
- 底稿、文字设定、输入提示、快捷设定同步切换；恢复版本时恢复对应底稿元数据。
- 鼠标和触屏画笔、橡皮擦、六色画笔、撤销重做。
- 二次曲线顺线；闭合区域识别与柔和填色。未闭合轮廓可能不会上色。
- DeepSeek 视觉分析和 JSON 配色规划，使用 deepseek-flash；网页保留用户原笔画。
- 十二个历史版本、原稿对比、IndexedDB 自动保存、作品画廊与 PNG 导出。

## DeepSeek 密钥
**不要把真实密钥粘贴进聊天、前端代码或 GitHub。**

后端读取 `DEEPSEEK_API_KEY`。可选 `DEEPSEEK_MODEL` 默认 `deepseek-flash`。`.env.example` 只包含空变量；真实 `.env*`、`.dev.vars*` 已被忽略。

部署时在后端运行平台的 **Secrets / 环境变量** 中配置 `DEEPSEEK_API_KEY`；不要写进 `.openai/hosting.json` 或 `wrangler.jsonc`。GitHub Pages 只能托管静态内容，无法安全保存后端密钥。此项目需要 Worker 后端。

当前 Sites 版本由平台提供 ChatGPT 身份，AI 端点检查 `oai-authenticated-user-id`、同源 Origin、输入大小和配色 JSON。平台负责移除客户端伪造的身份头。如果迁移到普通 Cloudflare Worker，必须实现自己的身份校验或配置 Cloudflare Access，并在可信边界验证身份；不能把来自公共请求的该头当作身份凭证。

AI 配色会发送当前草稿图片、设定和画风到 DeepSeek，产生 API 用量。点击 AI 按钮才会发送。未配置密钥时，本地顺线和上色仍可使用。

官方接口：https://api-docs.deepseek.com/api/create-chat-completion/
视觉能力：https://api-docs.deepseek.com/guides/vision/

## 开发与验证
无需依赖安装。`node scripts/check.mjs` 运行底稿与提示语同步、曲线、区域检测、请求校验、响应 JSON 校验及错误处理测试。API 测试全部使用模拟响应，不消耗额度。

`bash scripts/build.sh` 构建，`node scripts/validate-artifact.mjs` 验证 Worker 产物。开发适配器：`npm run dev`。

当前环境缺少 managed preview daemon；浏览器交互和手机布局尚未验证。未提供 DeepSeek 密钥，因此真实 API 连通性、模型权限和实际配色质量尚未验证。

## 版权、许可与致谢
本项目的六种画风描述改编自 **yang0 / handraw-style**：
- 原作者：**yang0**
- 原仓库：https://github.com/yang0/handraw-style
- 用户提供的 Fork：https://github.com/ZiyuFork/handraw-style
- 使用条目：FA-001、FA-002、FA-004、FA-005、FA-009、FA-015。

完整保留上游 **MIT License (with Attribution Requirement)**，见 [LICENSE](LICENSE)；资源来源和改编说明见 [NOTICE](NOTICE)。网页页脚展示原作者及原仓库链接，并提供完整许可页 `/license`。新增界面与绘图引擎为本项目编写，不声称上游作者开发或认可本产品。

作品保存在当前设备和浏览器，清除站点数据会删除作品。Sites 部署默认仅所有者可访问。发布 GitHub 源码不等于公开当前 Site 的访问权限。
