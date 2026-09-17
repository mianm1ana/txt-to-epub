# 部 → 卷 → 章升级

目标：区分部和卷，统一解析、纠错、网页目录与 EPUB 导航的父级归属。

数据：BookSection 新增 part 类型、partTitle；保留扁平阅读顺序。hierarchy.js 按位置而非名称计算 parentIndex/depth，重复卷名不混淆。简介清空父级，新部清空旧卷，卷归当前部，章归最近卷或部；不补造缺失节点。

排版：部首页使用左对齐大标题与暗红竖线，卷首保持居中细线样式，四类示例均可查看。

完成：解析、三级缩进、递归 nav、部统计、四类纠错、预览与导出已接入。

验证：verify:hierarchy、verify:book-structure、verify:presets、verify:section-edit、verify:cover、lint、build 通过。浏览器生成 2 部 3 卷 4 章，部改卷并撤销正常，已查看部首页与三级目录截图。未在实体阅读器上验证。
