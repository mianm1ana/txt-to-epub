# Progress

## Current Status

经典小说预设与排版示例已完成，原有卷章和封面回归通过。

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

## 可选封面

- [x] 封面上传、预览、导出与回归验证（doc/tasks/cover.md）

验证记录：
- `npm run verify:cover`：JPEG/PNG 字节、封面元数据、首位阅读顺序、导航、无封面和非法输入通过。
- `npm run verify:book-structure`、`npm run lint`、`npm run build`、`git diff --check` 通过。
- 浏览器实测选择 TXT、上传 PNG、显示封面预览、生成成功且下载可用、移除封面后预览消失且下载禁用。
- 本地开发服务器首次启动受沙箱端口限制，授权重试后正常运行。
- 尚未在实体阅读器或 EPUBCheck 中验证；浏览器 JPEG 上传与损坏图片解码未单独实测，签名和打包由脚本覆盖。

## 生成预设
- [x] 经典小说预设抽取、示例预览、生成接入和验证（presets.md）

预设验证记录：
- verify:presets、verify:book-structure、verify:cover、lint、build 均通过。
- 与 HEAD 中抽取前的 EPUB CSS 对比，逐字一致；解析器保持原函数。
- 浏览器确认无需上传即可看章节示例，简介/卷首/章节切换正常；使用 fixture 生成得到 2 卷 3 章，下载启用，实际章节预览展示分离的章号与标题。
- 已检查卷首截图及最终差异，无新依赖。
- 当前仅内置一个预设；多预设切换失效逻辑已接入，但尚无第二个产品预设供端到端切换。实体阅读器字体和分页可能不同，未作实体设备验证。

## 纸间界面优化
- [x] 深灰 / 琥珀色设计系统，CSS 变量统一颜色与间距。
- [x] 杂志式标题、品牌栏、工作台、文件上传区、纸张预览和章节空状态。
- [x] Font Awesome 6.7.2 经 cdnjs 加载；所有图标有文字标签，CDN 不可用不影响核心操作。
- [x] 桌面和 390px 手机视口视觉检查通过，手机无横向溢出；手机实测上传 TXT、生成 2 卷 3 章、启用下载、切换示例。
- [x] 预设、章节、封面回归，以及 lint、build、diff 检查通过。
界面改动未改变 EPUB 内部排版样式；用户已有预设改动保留。
