# Task: 手动解析与 EPUB 阅读样式

## Objective

取消上传时自动解析，让“生成 EPUB”同时负责解析和生成，并应用用户指定的 EPUB CSS 与卷首样式。

## Input Docs

- `doc/proposal.md`
- `doc/detailed-design.md`

## Expected Files

- `src/App.jsx`
- `src/components/BookForm.jsx`
- `src/App.css`
- `src/utils/epub.js`
- `scripts/verify-book-structure.mjs`

## Dependencies

依赖已完成的简介、卷、章数据结构。

## Implementation Steps

- [x] 文件选择不再自动解析。
- [x] 让“生成 EPUB”依次完成解析、预览更新和 EPUB 生成。
- [x] 换文件或编码时让旧结果失效。
- [x] 替换 EPUB 样式并添加卷标题 class。
- [x] 更新自动验证。

## Tests And Checks

```bash
npm run verify:book-structure
npm run lint
npm run build
```

## Definition Of Done

- [x] 点击生成时解析的流程完成
- [x] EPUB 样式检查通过
- [x] lint/build 通过
- [x] 进度文档更新
