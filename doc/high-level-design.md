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

## 封面扩展

本地 File → cover.js 校验签名与浏览器解码 → App 保存图片字节和预览 URL → BookForm 预览 → createEpub 打包。
使用 EPUB 3 cover-image、兼容性 cover meta、独立封面 XHTML 和首位 spine；章节导航保持原状，landmarks 提供封面入口。
选择 JPEG/PNG 以保持阅读器兼容性，不引入格式转换依赖。风险为大图内存与不同阅读器缩放差异，限制文件 10 MiB，等比例展示。
