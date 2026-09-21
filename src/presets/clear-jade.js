import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const clearJadePreset = {
    id: "clear-jade-novel",
    name: "霁青",
    description: "雨落得再久，天也总会晴。为那些穿过阴翳、终于见到远山的故事。",
    rules: [
        "自动划分简介、部、卷、章节；支持部 → 卷 → 章，也支持部下直接分章、无部或无卷的小说。",
        "支持中文章号、Chapter N、番外和完本感言；更换部时重置卷归属。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；正文首行缩进两字，行距清朗舒展。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一个关于雨后远行的故事。有人把一生困在一座城里，等一场不会来的晴天；也有人明知山外仍有风雨，还是在清晨推开了门。

第一部 山色初霁
七日春雨洗过旧城。青瓦泛着冷光，石桥下的水涨得很满，城外的群山像一群沉默的巨兽，伏在薄雾的尽头。

第一卷 天游
父亲留下的地图摊在灯下，边角被雨水洇得模糊，唯有北山尽头那座早已废弃的驿站，被人用朱砂重重圈了一笔。

第一章 云开处
第一章 云开处
清晨，她背着书箱走过石桥，鞋底踏碎水面上破开的天光。河岸的柳树刚抽新芽，卖花的老人缩在檐下，把白梅一枝枝插进粗陶瓶里，像在替这个漫长的冬天收尾。
城门还没开。守门人认得她，问她要去哪里。她想了想，说去找一个从没去过的地方。那人笑了，觉得这是少年人才会说的话；可她已经很久没有把自己当成少年了。
北山的云正在散开，露出一道青白色的天隙。她把地图贴身收好，听见远处有钟声越过湿润的空气，仿佛有人在山那边叫她的名字。她没有回头。路很长，雨也未必真的停了，但她终于明白，人不是等到天晴才出发的。`, 
    css: `/* 霁青：雨后瓷色与宽阔留白，保持文字像洗净后的山光一样清晰。 */
body {
    max-width: 37em;
    margin: 0 auto;
    padding: 0 1.25em 3em;
    background: #f7faf6;
    color: #263d38;
    font-family: serif;
    font-size: 100%;
    line-height: 1.98;
    text-align: justify;
    text-justify: inter-ideograph;
}

p {
    margin: 0.78em 0;
    line-height: 1.98;
    text-indent: 2em;
    orphans: 2;
    widows: 2;
}

img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.8em auto;
    border: 1px solid #c9dbd2;
    border-radius: 2px;
}

.opening {
    max-width: 31em;
    margin: 0 auto;
    padding: 0.2em 0.4em 2.8em;
}

h1,
h2 {
    color: #24453e;
    font-weight: normal;
    text-indent: 0;
    overflow-wrap: break-word;
    page-break-after: avoid;
    break-after: avoid;
}

/* 部首像雨后山门，以淡青竖线收束。 */
h1.part-title {
    margin: 4em 0 2.2em;
    padding: 0.15em 0 0.15em 0.82em;
    border-left: 3px solid #78a99b;
    color: #20443c;
    font-size: 2.08em;
    letter-spacing: 0.18em;
    line-height: 1.65;
    text-align: left;
}

.part-number {
    display: inline-block;
    margin-bottom: 1.35em;
    color: #578d7f;
    font-size: 0.4em;
    letter-spacing: 0.38em;
    line-height: 1.5;
}

.part-name { letter-spacing: 0.2em; }
.opening--part p { color: #46645c; line-height: 2.02; }
.opening--part::after {
    content: "";
    display: block;
    width: 3.2em;
    margin: 2.8em 0 0;
    border-top: 1px solid #9bc2b5;
}

/* 卷首用瓷器般的双细线，和部首页的方向感不同。 */
h1.volume-title {
    margin: 4.8em 0 2.4em;
    padding: 1.15em 0;
    border-top: 1px solid #a9c8bd;
    border-bottom: 1px solid #a9c8bd;
    color: #274b42;
    font-size: 1.82em;
    letter-spacing: 0.18em;
    line-height: 1.7;
    text-align: center;
}

.volume-number {
    display: inline-block;
    margin: 0 0 1.35em 0.35em;
    color: #609a8b;
    font-size: 0.48em;
    letter-spacing: 0.4em;
    line-height: 1.5;
}

.volume-name { display: inline-block; font-size: 1.14em; letter-spacing: 0.24em; }
.opening--volume p { color: #46645c; line-height: 2.02; }

h2.intro-title {
    margin: 3.4em 0 1.8em;
    padding-bottom: 0.7em;
    border-bottom: 1px solid #b9d1c7;
    color: #3b7568;
    font-size: 1.48em;
    letter-spacing: 0.3em;
    line-height: 1.55;
    text-align: left;
}

.opening--intro p { color: #45645b; line-height: 2.04; }
.opening--intro p:first-of-type { text-indent: 0; }
.opening--intro::after {
    content: "◇";
    display: block;
    margin-top: 2.3em;
    color: #76a99b;
    font-size: 0.9em;
    text-align: center;
}

/* 正文章号简净如一枚淡色印记。 */
h2.head {
    margin: 3em 0 1.45em;
    color: #24453e;
    font-size: 1.48em;
    letter-spacing: 0.16em;
    line-height: 1.7;
    text-align: center;
}

h2.head span {
    display: inline-block;
    margin-bottom: 0.95em;
    padding: 0.22em 0.6em;
    border: 1px solid #82aa9e;
    color: #477d70;
    font-size: 0.62em;
    letter-spacing: 0.28em;
    line-height: 1.45;
}

h2.head::after {
    content: "";
    display: block;
    width: 4em;
    margin: 1em auto 0;
    border-top: 1px solid #c4d9d0;
}

.dialogue { color: #355b52; }
blockquote {
    margin: 1.5em 0;
    padding: 0.2em 0 0.2em 1em;
    border-left: 2px solid #9abdb2;
    color: #57746b;
}
strong { color: #1d3832; font-weight: bold; }
hr { width: 3.5em; margin: 2.8em auto; border: none; border-top: 1px solid #9abdb2; }

@media (max-width: 480px) {
    body { padding-left: 0.8em; padding-right: 0.8em; }
    h1.part-title { font-size: 1.88em; }
    h1.volume-title { font-size: 1.65em; }
}
`,
};
