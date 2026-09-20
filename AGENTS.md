# 项目协作说明

## 项目定位

纯浏览器运行的 React + Vite 工具：把中文 TXT 解码为简介/部/卷/章，提供预览和章节纠错，并用 JSZip 生成 EPUB 3。没有后端；TXT、封面、解析和打包都在浏览器内存中完成。

## 运行与验证

需要 Node.js 20+ 和 npm。常用命令：

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

回归脚本：`npm run verify:book-structure`、`verify:cover`、`verify:presets`、`verify:section-edit`、`verify:hierarchy`。解析、层级、预设、封面或 EPUB 改动后运行相关脚本、`npm run lint`、`npm run build` 和 `git diff --check`。

## 权威文档与目录

- `README.md`：用户功能、使用方式、限制和扩展入口。
- `doc/high-level-design.md`、`doc/detailed-design.md`：架构与机制；`doc/tasks/progress.md`：历史进度和已知验证限制。
- `src/App.jsx`：页面状态与生成流程；`src/components/`：表单、目录、纠错和 iframe 预览。
- `src/utils/text.js`：解码与标题识别；`hierarchy.js`：按位置算父级/深度；`section-edit.js`：纯函数纠错。
- `src/presets/`：预设注册、解析、CSS、XHTML 和样张；当前唯一预设是 `classic-novel`/“欲语”。
- `src/utils/book-render.js`、`epub.js`：共享 XHTML/XML 转义与 EPUB 包；`cover.js`、`download.js`：封面与下载。
- `scripts/`：Node.js 断言和 TXT fixture；`public/`：静态品牌资源。不要手工修改 `dist/`、`node_modules/` 或生成的二进制资源。

## 必须保持的边界

- `BookSection` 是保持阅读顺序的扁平数组：`type` 为 `intro | part | volume | chapter`，另有 `title`、`partTitle`、`volumeTitle`、`paragraphs`。父级关系必须用 `buildHierarchy` 的位置关系，不能按标题名称匹配；结果经 `normalizeSections` 规范化。
- 选择 TXT、修改编码或切换预设只让旧结果失效；点击“生成 EPUB”才解码和解析。已有已应用纠错的 `sections` 再生成时必须复用，不能重新解析覆盖。
- 纠错支持标题/类型修改、向前合并和最近 30 次撤销；未应用输入不进入预览或导出。文件、编码、预设变化会清空纠错历史。
- 解析规则要避免正文误判：支持中文卷/部章、`Chapter N`、序章/楔子/番外/完本感言和括号标题；无标题文本成为“正文”章节。扩展正则必须补回归测试。
- 预设必须提供唯一 `id`、`parse`、`css`、`renderSection`、`sampleText` 等字段；预览和 EPUB 必须复用同一渲染器/CSS，输出中的标题、正文和元数据必须 `escapeXml`。
- 封面只接受经签名和浏览器解码验证的 JPG/PNG，最大 10 MiB；保留原比例，导出时封面页位于 spine 首位。封面变更/移除时清空旧 Blob 并释放 object URL。
- EPUB 的 `mimetype` 必须第一个且不压缩；每个 section 保持一个 XHTML 和同序 spine；`nav.xhtml` 与网页目录共用 `buildHierarchy` 的嵌套层级。

## 修改原则与状态

- 保持现有 ESM、React/Vite 边界，不引入无关重构或新依赖；修改解析/层级/渲染时同步检查网页目录、预览、EPUB nav、spine 和统计。
- 更新现役行为时同步 README 或设计文档；历史方案和验证限制保留在 `doc/`，不要把已完成待办当作当前计划。
- 当前无部署/生产验证面、无项目级持久化记忆，也没有用户自定义预设、插图导入、封面裁剪或实体阅读器/EPUBCheck 自动化验证；字体和分页可能与浏览器预览不同。
