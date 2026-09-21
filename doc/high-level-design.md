# High-Level Design

## Architecture Overview

数据流为：TXT 文件 → `decodeTxtFile` → `parseBookSections` → React state → 网页预览 / `createEpub`。

## Module Boundaries

- `src/utils/text.js`：解码与结构识别。
- `src/components/ChapterList.jsx`：通过 `buildHierarchy` 按类型和位置展示目录层级。
- `src/components/ChapterPreview.jsx`：在 sandbox iframe 中复用所选预设的 XHTML 与 CSS 渲染实际章节。
- `src/components/PresetPreview.jsx`：在未上传原稿时也提供默认展开的预设样张与规则说明。
- `src/utils/epub.js`：生成内容文件、嵌套导航和 EPUB 包。
- `src/App.jsx`：协调状态、统计和生成流程。

## Data Contract

```js
{
  type: "intro" | "part" | "volume" | "chapter",
  title: string,
  partTitle: string,
  volumeTitle: string,
  paragraphs: string[],
}
```

简介、部的父级标题为空；卷记录所属部，章记录所属部与卷。缺少层级时对应标题为空。

## Major Decisions

- 使用扁平数组保存阅读顺序，降低 React state 和 EPUB spine 的复杂度。
- `hierarchy.js` 按阅读顺序计算父节点位置和深度，供网页目录、EPUB 导航与纠错共用；标题仅作显示，不作为父节点标识，支持重名卷。
- 卷也生成独立 XHTML，保证阅读顺序和目录锚点稳定。
- 桌面章节工作台采用固定总高度：目录、固定 230 px 的纠错区与剩余高度的章节预览各自滚动；窄屏改为纵向堆叠，避免长目录挤出预览区。

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

## 预设架构
预设注册表组合 id/name/description/rules/parse/css/renderSection/sampleText。内置「欲语」和「微澜」均复用当前解析器与共享 XHTML 渲染器，仅以独立 CSS 呈现不同阅读气质。App 用选中预设解析，createEpub 用同一 id 输出。示例和正文预览在 sandbox iframe 中复用预设渲染与 CSS，避免全局样式污染。无需新依赖。风险：阅读器字体、分页与浏览器可能不同；界面说明该限制。
