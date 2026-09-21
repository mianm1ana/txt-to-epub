import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const classicPreset = {
    id: "classic-novel",
    name: "欲语",
    description: "暗红如旧梦，红妆照故人；有些话等到想说时，只剩下泪先流。",
    rules: [
        "自动划分简介、部、卷、章节；支持部 → 卷 → 章，也支持部下直接分章、无部或无卷的小说。",
        "支持中文章号、Chapter N、番外和完本感言；更换部时重置卷归属。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；正文首行缩进两字，行距 1.8。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一个关于迟到的故事。人总以为故乡、旧人和从前的月色都会在原地等他，直到某天回头，才发现命运早已替所有人写完了后来。

第一部 长街旧梦
旧城仍有春风，仍有杏花，却再没有那个会在桥头等他归来的少女。

第一卷 红妆
他离开那年，她还只爱穿素色的衣裳；等他归来时，才知道原来最鲜艳的红，也可以是人间最远的颜色。

第一章 故人
第一章 故人
白日里，他经过城南的绸庄，看见她坐在临街的镜前画眉。她低着头，将胭脂一点点抹上唇角，鬓边簪了一枝新开的海棠。阳光落在她的红妆上，像许多年前那场未及饮完的喜酒，明亮，却已经凉透了。
他想起离城前的那个夜晚，她站在渡口替他系紧披风，说等他功成归来，便穿红衣等他。后来他在烽火里走了很多年，见过荒芜的城池、死去的故人和无数个没有月亮的夜晚；他以为自己守住了那个约定，却不知道命运早已先他一步，把她带往了另一个人的身边。
她终于从镜中看见了他，怔了很久，才轻轻唤了一声他的名字。那一声名字还和从前一样，可她身后有人唤她夫人，门外还有孩子笑着跑过青石街。他原想告诉她，自己回来得太晚了；原想问她，这些年可曾等过。可他只是站在春风里，看着她的红妆，忽然明白物是人非，旧事皆休。欲语泪先流。`,
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

/* 同一暗红色系，简介为导读页、卷首为扉页，正文保留印签。 */
.opening {
    max-width: 32em;
    margin: 0 auto;
    padding: 0 1em 2em;
}

/* 部首页：偏左的篇章扉页；卷首保持居中的细线风格。 */
h1.part-title {
    margin: 2.8em 0 1.5em;
    padding: 0.3em 0 0.3em 0.7em;
    border-left: 3px solid #8b3a3a;
    font-size: 2.2em;
    line-height: 1.6;
    text-align: left;
    color: #333;
    overflow-wrap: break-word;
    page-break-after: avoid;
    break-after: avoid;
}

.part-number {
    display: inline-block;
    margin-bottom: 1.8em;
    font-size: 0.38em;
    font-weight: normal;
    letter-spacing: 0.3em;
    color: #8b3a3a;
}

.part-name { letter-spacing: 0.12em; }
.opening--part p { color: #555; line-height: 1.9; }

h1.volume-title {
    margin: 3.5em 0 1.8em;
    padding: 0;
    font-size: 1.8em;
    line-height: 1.7;
    letter-spacing: 0.15em;
    text-align: center;
    text-indent: 0;
    color: #333;
    page-break-after: avoid;
    break-after: avoid;
}

.volume-number {
    display: inline-block;
    padding: 0 0 0.65em;
    margin-bottom: 1.6em;
    border-bottom: 1px solid #8b3a3a;
    color: #8b3a3a;
    letter-spacing: 0.35em;
    font-size: 0.5em;
    font-weight: normal;
    line-height: 1.5;
}

.volume-name {
    font-size: 1.2em;
    letter-spacing: 0.25em;
    overflow-wrap: break-word;
}

h1.volume-title::after {
    content: "";
    display: block;
    width: 1px;
    height: 1.6em;
    margin: 1em auto 0;
    border-left: 1px solid #8b3a3a;
}

.opening--volume p {
    max-width: 26em;
    margin: 1em auto;
    color: #555;
    line-height: 1.9;
}

h2.intro-title {
    margin: 2.8em 0 1.5em;
    padding-bottom: 0.7em;
    border-bottom: 1px solid #c9b5b1;
    text-align: left;
    font-size: 1.5em;
    letter-spacing: 0.25em;
}

.intro-title span {
    color: #8b3a3a;
    font-weight: normal;
    line-height: 1.5;
}

.opening--intro p {
    line-height: 1.9;
    margin: 1em 0;
}

.opening--intro p:first-of-type {
    text-indent: 0;
    color: #555;
}

.opening--intro::after {
    content: "";
    display: block;
    width: 2.8em;
    margin: 2em 0 0;
    border-top: 1px solid #8b3a3a;
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
