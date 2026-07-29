# Detailed Design

## File Changes

- `src/utils/text.js`：新增并导出 `parseBookSections`。
- `src/App.jsx`：使用 sections 数据与分类型计数。
- `src/components/ChapterList.jsx`：给简介、卷、章增加类型 class。
- `src/components/ChapterPreview.jsx`：卷用 h1，其他用 h2。
- `src/App.css`：章节缩进和卷标题预览样式。
- `src/utils/epub.js`：按类型渲染并构建嵌套目录。

## Parsing Algorithm

1. 标准化换行并逐行 trim。
2. 在第一次结构标题出现前缓存非空行。
3. 首次遇到卷或章时，把缓存内容插入为“简介”。
4. 卷标题创建 volume section，并更新当前卷。
5. 章标题创建 chapter section，并记录当前卷标题。
6. 普通文字加入当前 section。
7. 若从未发现结构标题，将全部文字作为“正文”章节。

## Rendering Rules

- volume：`h1`
- intro/chapter：`h2`
- 导航：简介和无卷章节为顶层项；卷为顶层项，所属章节放在内部 `ol`。

## Error Handling And Edge Cases

- 空文本返回空数组，沿用生成阶段错误提示。
- 卷后无章节仍保留卷页面。
- 卷后的说明文字保存在卷 section 中。
- 第二卷出现后，新章节归入第二卷。

## Verification

- lint、生产构建。
- 有卷、无卷、无标题解析断言。
- EPUB 文件内 h1/h2 与 nav.xhtml 嵌套断言。
