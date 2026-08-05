# Task: 收紧卷章标题识别

## Objective

支持括号包裹的卷标题，并避免正文中的“第X卷”字眼被误识别。

## Input Docs

- `doc/proposal.md`
- `doc/detailed-design.md`

## Expected Files

- `src/utils/text.js`
- `scripts/verify-book-structure.mjs`

## Dependencies

依赖现有 `BookSection` 数据结构。

## Implementation Steps

- [x] 增加强格式括号标题规则。
- [x] 收紧无括号卷章标题规则。
- [x] 要求裸标题使用结束、空格或冒号作为边界。
- [x] 添加用户示例和正文误判回归测试。

## Tests And Checks

```bash
npm run verify:book-structure
npm run lint
npm run build
```

## Definition Of Done

- [x] 括号卷标题识别正确
- [x] 正文卷字眼不再误判
- [x] 原有卷章格式继续通过
- [x] 所有检查通过
