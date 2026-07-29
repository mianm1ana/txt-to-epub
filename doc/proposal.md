# Proposal: 简介、卷、章分层

## Goal

将 TXT 解析为简介、卷、章三类内容，并让网页预览与 EPUB 输出保留相同层级。

## Non-Goals

- 本次不提供手动合并、拆分或拖拽排序。
- 本次不引入新的第三方依赖。

## Users And Runtime Context

用户在浏览器本地上传中文小说 TXT，预览识别结果后生成 EPUB 3 文件。

## Functional Requirements

- 第一个卷标题或章节标题之前的非空文字识别为“简介”。
- `第X卷...` 识别为卷，正文和网页中使用一级标题。
- `第X章/节/回/篇...`、`Chapter N...` 及序章等识别为章，使用二级标题。
- 没有卷的小说仍能直接识别章节。
- 完全没有结构标题的 TXT 作为单个“正文”章节。
- EPUB 导航目录在存在卷时嵌套其所属章节。

## Inputs And Outputs

- 输入：解码后的纯文本。
- 中间数据：`BookSection[]`。
- 输出：网页章节预览与 EPUB Blob。

## Dependencies And Constraints

- React 19、JSZip 3，保持纯浏览器处理。
- 沿用现有文件结构和 CSS，不做无关重构。

## Success Criteria

- 有卷、无卷、无标题三类文本解析正确。
- 简介与章节为 `h2`，卷为 `h1`。
- EPUB 目录中卷包含其所属章节。

## Acceptance Checks

- `npm run lint`
- `npm run build`
- 使用脚本断言解析结果并检查生成 EPUB 内部 XHTML/nav.xhtml。

## Assumptions

- 卷标题之后、第一章之前的文字属于该卷。
- 空行不作为段落保存，沿用现有行为。

## Open Questions

无阻塞问题。
