# Progress

## Current Status

卷章标题识别规则已收紧并通过验证。

## Tasks

- [x] 简介、卷、章分层 - 已完成
- [x] 手动解析与 EPUB 阅读样式 - 已完成
- [x] 收紧卷章标题识别 - 已完成

## Commands Run

- 已检查现有源码和 npm scripts。
- 已实现解析器、网页预览和 EPUB 分层输出。
- `npm run verify:book-structure` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器初始页面烟雾检查通过；上传自动化受浏览器文件权限限制，上传后的结构由脚本覆盖。
- 上传 TXT 现在只保存文件；点击“生成 EPUB”才解析并生成。
- 已替换 EPUB 阅读样式并增加卷首与红色章节编号样式。
- 更新后的 `npm run verify:book-structure`、lint、build 均通过。
- 支持 `【第一卷：戏中人】` 等括号标题，并避免正文“第五卷这个字眼”误判。
- 新增真实格式和误判场景回归测试，解析、lint、build 通过。
- 番外、带序号番外和完本感言现按普通章节识别并使用相同标题样式。
- `第X部` 现与 `第X卷` 一样识别为 volume，并增加正文误判测试。

## Decisions

- 使用扁平 `BookSection[]` 加 `volumeTitle` 关系。
- 卷后第一章前的文字属于卷。

## Blockers

无。

## Next Steps

无。
