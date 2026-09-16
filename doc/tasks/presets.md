# Task: 生成预设与美化示例

目标：把当前划分与排版作为经典小说内置预设，并可预览。
输入：proposal、high-level-design、detailed-design、progress。
文件：src/presets/*、src/utils/book-render.js、epub.js、App.jsx、BookForm.jsx、ChapterPreview.jsx、PresetPreview.jsx、App.css、scripts/verify-presets.mjs、package.json。
依赖：当前解析器、React、JSZip。
步骤：抽取共享渲染及样式；注册预设；接入生成与示例切换；复用实际章节预览；验证并记录。
检查：npm run verify:presets、verify:book-structure、verify:cover、lint、build，浏览器示例切换和实际生成。
完成标准：保留现有输出，预设示例与 EPUB 同源，所有检查通过并记录限制。

状态：已完成。验证及限制见 progress.md。
