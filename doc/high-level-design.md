# High-Level Design

## Architecture Overview

数据流为：TXT 文件 → `decodeTxtFile` → `parseBookSections` → React state → 网页预览 / `createEpub`。

## Module Boundaries

- `src/utils/text.js`：解码与结构识别。
- `src/components/ChapterList.jsx`：按类型展示目录层级。
- `src/components/ChapterPreview.jsx`：按类型选择 h1/h2。
- `src/utils/epub.js`：生成内容文件、嵌套导航和 EPUB 包。
- `src/App.jsx`：协调状态、统计和生成流程。

## Data Contract

```js
{
  type: "intro" | "volume" | "chapter",
  title: string,
  volumeTitle: string,
  paragraphs: string[],
}
```

简介和卷的 `volumeTitle` 为空；章在有卷时记录所属卷标题。

## Major Decisions

- 使用扁平数组保存阅读顺序，降低 React state 和 EPUB spine 的复杂度。
- 用 `volumeTitle` 建立卷章关系，生成导航时再组合成嵌套列表。
- 卷也生成独立 XHTML，保证阅读顺序和目录锚点稳定。

## Alternatives Considered

嵌套 `volumes[].chapters[]` 更贴近目录结构，但会增加无卷章节、简介和顺序遍历的复杂度，暂不采用。

## Risks

小说标题格式差异较大；本次沿用明确的第X卷、第X章等规则，之后可扩展可配置正则。

## Test Strategy

通过 Node 断言解析数据，并解压生成 Blob 检查 XHTML 标题标签和嵌套导航。
