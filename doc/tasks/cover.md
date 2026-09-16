# Task: EPUB 可选封面

## Objective
支持上传、预览、更换、移除 JPG/PNG，并导出标准封面。

## Input Docs
doc/proposal.md、doc/high-level-design.md、doc/detailed-design.md。

## Expected Files
src/utils/cover.js、src/utils/epub.js、src/App.jsx、src/components/BookForm.jsx、src/App.css、scripts/verify-cover.mjs、package.json。

## Dependencies
现有 React 和 JSZip，无新依赖。

## Implementation Steps
- [x] 文件校验和预览生命周期
- [x] 表单与生成状态衔接
- [x] 图片、封面 XHTML 和 OPF/navigation 写入
- [x] 回归验证并更新进度

## Tests And Checks
npm run verify:cover；npm run verify:book-structure；npm run lint；npm run build；浏览器烟雾检查。

## Definition Of Done
上述检查通过，封面可选且不会污染正文结构，进度记录包含限制。
