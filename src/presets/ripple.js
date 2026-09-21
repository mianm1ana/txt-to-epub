import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const ripplePreset = {
    id: "ripple-novel",
    name: "微澜",
    description: "水墨青绿与留白交织的静读版式，章节如水面微起的涟漪。",
    rules: [
        "自动划分简介、部、卷、章节；支持部 → 卷 → 章，也支持部下直接分章、无部或无卷的小说。",
        "支持中文章号、Chapter N、番外和完本感言；更换部时重置卷归属。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；正文首行缩进两字，行距舒展为 1.95。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一个关于河流与重逢的故事。许多未说出口的话，会在夜深时随水声慢慢抵达。

第一部 雾起南岸
那一年秋天来得很早，渡口的灯在薄雾里亮了一整夜。

第一卷 旧信
信封上的字迹已经淡去，只有纸页间夹着的一片银杏叶，仍保留着午后的颜色。

第一章 临河的灯
第一章 临河的灯
暮色落进河湾时，她听见有人在身后叫自己的名字。声音很轻，像风掠过书页。
她没有立刻回头，只把那封旧信握得更紧。河对岸的灯一盏接一盏亮起来，仿佛有人替漫长的等待写下了答案。
水面起了微澜，船缓缓离岸。`,
    css: `/* 微澜：为长篇中文小说保留安静、通透的呼吸感。 */

body {
    max-width: 36em;
    margin: 0 auto;
    padding: 0 1.1em 2.5em;
    color: #283431;
    line-height: 1.95;
    text-align: justify;
    text-justify: inter-ideograph;
}

p {
    margin: 0.7em 0;
    line-height: 1.95;
    text-indent: 2em;
    orphans: 2;
    widows: 2;
}

img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.6em auto;
    border-radius: 2px;
}

/* 让简介、部与卷各自像翻开新的一页，又不依赖重背景。 */
.opening {
    max-width: 31em;
    margin: 0 auto;
    padding: 0 0.25em 2.4em;
}

h1,
h2 {
    color: #25332f;
    text-indent: 0;
    font-weight: normal;
    page-break-after: avoid;
    break-after: avoid;
    overflow-wrap: break-word;
}

h1.part-title {
    margin: 3.8em 0 2.1em;
    text-align: center;
    font-size: 2.15em;
    line-height: 1.55;
    letter-spacing: 0.2em;
}

.part-number,
.volume-number {
    display: inline-block;
    color: #5f827a;
    font-family: serif;
    font-size: 0.38em;
    font-weight: normal;
    letter-spacing: 0.42em;
    line-height: 1.5;
}

.part-number {
    margin: 0 0 1.7em 0.42em;
    padding-bottom: 0.9em;
    border-bottom: 1px solid #9eb9b1;
}

.part-name {
    display: inline-block;
    letter-spacing: 0.2em;
}

.opening--part p {
    color: #4d5c57;
    line-height: 2;
}

.opening--part::after,
.opening--volume::after {
    content: "~";
    display: block;
    margin-top: 2.4em;
    color: #7b9d94;
    font-size: 1.25em;
    letter-spacing: 0.4em;
    text-align: center;
}

h1.volume-title {
    margin: 4.6em 0 2.3em;
    text-align: center;
    font-size: 1.85em;
    line-height: 1.75;
    letter-spacing: 0.16em;
}

.volume-number {
    margin: 0 0 1.5em 0.42em;
    padding: 0.28em 0.1em 0.78em 0.52em;
    border-bottom: 1px solid #5f827a;
}

.volume-name {
    display: inline-block;
    font-size: 1.15em;
    letter-spacing: 0.24em;
}

.opening--volume p {
    max-width: 27em;
    margin: 1em auto;
    color: #4d5c57;
    line-height: 2;
}

h2.intro-title {
    margin: 3.3em 0 1.6em;
    padding: 0 0 0.75em 0.85em;
    border-left: 2px solid #5f827a;
    border-bottom: 1px solid #c4d2cb;
    color: #52746c;
    font-size: 1.45em;
    letter-spacing: 0.32em;
    line-height: 1.5;
    text-align: left;
}

.intro-title span {
    font-weight: normal;
}

.opening--intro p {
    color: #4d5c57;
    line-height: 2;
}

.opening--intro p:first-of-type {
    text-indent: 0;
}

.opening--intro::after {
    content: "· · ·";
    display: block;
    margin-top: 2.1em;
    color: #77978f;
    letter-spacing: 0.38em;
    text-align: center;
}

/* 章节标题保持克制：章号像水位标记，标题在其下安静落定。 */
h2.head {
    margin: 2.7em 0 1.2em;
    color: #273631;
    font-size: 1.48em;
    letter-spacing: 0.16em;
    line-height: 1.7;
    text-align: center;
}

h2.head span {
    display: inline-block;
    margin-bottom: 1em;
    padding: 0.25em 0.1em 0.62em 0.48em;
    border-bottom: 1px solid #7a9c93;
    color: #52746c;
    font-size: 0.62em;
    font-weight: normal;
    letter-spacing: 0.42em;
    line-height: 1.45;
}

h2.head::after {
    content: "";
    display: block;
    width: 2.8em;
    margin: 0.9em auto 0;
    border-top: 1px solid #c4d2cb;
}

.dialogue {
    color: #405d56;
}

blockquote {
    margin: 1.4em 0;
    padding: 0.15em 0 0.15em 1em;
    border-left: 2px solid #9db8b0;
    color: #60736d;
}

strong {
    color: #1d2a26;
    font-weight: bold;
}

hr {
    width: 3em;
    margin: 2.6em auto;
    border: none;
    border-top: 1px solid #9db8b0;
}

@media (max-width: 480px) {
    body {
        padding-left: 0.75em;
        padding-right: 0.75em;
    }

    h1.part-title {
        font-size: 1.95em;
    }
}
`,
};
