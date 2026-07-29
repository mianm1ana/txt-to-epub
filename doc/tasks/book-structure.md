# Task: 简介、卷、章分层

## Objective

完成文本解析、网页预览和 EPUB 输出的分层支持。

## Input Docs

- `doc/proposal.md`
- `doc/high-level-design.md`
- `doc/detailed-design.md`

## Expected Files

- `src/utils/text.js`
- `src/App.jsx`
- `src/components/ChapterList.jsx`
- `src/components/ChapterPreview.jsx`
- `src/App.css`
- `src/utils/epub.js`

## Dependencies

无新增依赖。

## Implementation Steps

- [x] 实现 `parseBookSections`。
- [x] 更新 App 状态与计数。
- [x] 更新目录与内容预览。
- [x] 更新 EPUB XHTML 和嵌套导航。
- [x] 完成验证。

## Tests And Checks

```bash
npm run lint
npm run build
```

另运行 Node 断言脚本检查解析和 EPUB 内容。

## Definition Of Done

- [x] 代码实现
- [x] 解析样例通过
- [x] lint/build 通过
- [x] 文档状态更新
