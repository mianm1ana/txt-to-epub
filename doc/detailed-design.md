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

## Heading Recognition

- 带 `【】`、`[]`、`［］`、`《》` 的卷章标题视为强格式标题。
- `第X卷` 与 `第X部` 使用相同的 volume 类型和识别边界。
- 裸标题支持 `第一卷`、`第一卷：标题`、`第一卷 标题`。
- 裸标题必须在编号后结束，或使用空格/冒号分隔标题正文。
- `第五卷中提到了……` 因卷字后没有标题分隔符，不识别为卷。
- 番外和完本感言归类为 chapter，并复用章节标题与 EPUB 导航逻辑。
- 标题长度限制为 80 字，并拒绝含句号或分号的候选行。

## Rendering Rules

- volume：`h1`
- intro/chapter：`h2`
- 导航：简介和无卷章节为顶层项；卷为顶层项，所属章节放在内部 `ol`。
- 卷标题增加 `volume-title` class；章节标题增加 `head` class，并在可拆分时用 span 包裹章节编号。

## Parse And Generate Flow

1. `handleFileChange` 只保存文件、设置默认书名并清空旧结果。
2. `handleEncodingChange` 只更新编码并清空旧结果。
3. `handleGenerate` 先解码并调用 `parseBookSections`，把结果显示到页面。
4. 同一次 `handleGenerate` 使用刚解析的 sections 生成 EPUB Blob。
5. 没有文件时禁用“生成 EPUB”；没有 Blob 时禁用下载。

## Error Handling And Edge Cases

- 空文本返回空数组，沿用生成阶段错误提示。
- 卷后无章节仍保留卷页面。
- 卷后的说明文字保存在卷 section 中。
- 第二卷出现后，新章节归入第二卷。

## Verification

- lint、生产构建。
- 有卷、无卷、无标题解析断言。
- EPUB 文件内 h1/h2 与 nav.xhtml 嵌套断言。
