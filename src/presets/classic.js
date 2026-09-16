import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const classicPreset = {
    id: "classic-novel",
    name: "经典小说",
    description: "沿用当前划分与美化：分层目录、独立卷首、红色章号与首行缩进。",
    rules: [
        "自动划分简介、卷 / 部、章节；支持中文章号、Chapter N、番外和完本感言。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；正文首行缩进两字，行距 1.8。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一段小说简介。远山与长河之间，一段故事正缓缓展开。

第一卷 风起
晨光越过山脊，照亮了通往远方的小路。

第一章 初见
第一章 初见
清晨，街巷里还带着昨夜雨水的气息。她推开木窗，看见一封信静静地躺在门前。
“你终于来了。”来人轻声说道，仿佛他们早已认识了许多年。
她把信收进衣袋，沿着河岸向前走去。故事，就从这个平凡的早晨开始。`,
    css: `/* =========================
   全局
   Kindle / 手机友好
   ========================= */

body {
    line-height: 1.8;
    text-align: justify;
}


/* =========================
   正文排版
   ========================= */

p {
    text-indent: 2em;
    line-height: 1.8;
    margin: 0.8em 0;
}


/* =========================
   图片
   ========================= */

img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.5em auto;
    border-radius: 6px;
}


/* =========================
   普通章节标题
   ========================= */

h1 {
    font-size: 1.5em;
    line-height: 1.2;

    text-align: center;
    text-indent: 0;

    font-weight: bold;

    margin: 1em 0;
}


/* =========================
   卷标题
   第一卷 风起
   ========================= */

h1.volume-title {
    margin: 25% 0 2.5em;
    padding: 1.2em 0.5em;

    font-size: 1.8em;
    line-height: 1.5;
    letter-spacing: 0.2em;

    text-align: center;
    text-indent: 0;
    font-weight: bold;

    color: #3f3327;

    border-top: 1px solid #b9a58c;
    border-bottom: 1px solid #b9a58c;

    page-break-after: avoid;
    break-after: avoid;
}


/* =========================
   章节标题
   第1章
   宋氏【修】
   ========================= */

h2 {
    margin: 2em 0 2em;

    text-align: center;
    text-indent: 0;

    font-size: 1.4em;
    font-weight: bold;

    color: #333;

    letter-spacing: 0.15em;

    line-height: 1.5;

    page-break-after: avoid;
    break-after: avoid;
}


/* 红色章节编号 */

h2.head span {
    display: inline-block;

    padding: 0.15em 0.6em;

    margin-bottom: 0.8em;

    color: #fff;

    background-color: #8b3a3a;

    font-size: 0.7em;

    font-weight: normal;

    line-height: 1.5;
}


/* =========================
   对话
   ========================= */

.dialogue {
    color: #405a66;
}


/* =========================
   引用
   ========================= */

blockquote {
    margin: 1em 0;

    padding-left: 1em;

    color: #666;

    border-left: 3px solid #ccc;
}


/* =========================
   强调
   ========================= */

strong {
    font-weight: bold;
    color: #222;
}


/* =========================
   分隔符
   ========================= */

hr {
    width: 30%;

    margin: 2em auto;

    border: none;

    border-top: 1px solid #ccc;
}`,
};
