import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const flowerLetterPreset = {
    id: "flower-letter-novel",
    name: "花笺",
    description: "春风会替人送信，花笺里那些没有说尽的话，也总有抵达的一天。",
    rules: [
        "自动划分简介、部、卷、章节；支持部 → 卷 → 章，也支持部下直接分章、无部或无卷的小说。",
        "支持中文章号、Chapter N、番外和完本感言；更换部时重置卷归属。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；正文首行缩进两字，行距温和从容。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一个关于书信与春天的故事。人总以为错过就是没有说出口的那句话，后来才知道，真正的错过，是那句话写好了，却再也找不到该收信的人。

第一部 春信
三月的风穿过城南长街，檐下的风铃响了一整日。书铺门前的海棠开了第一朵，像谁在旧信封上按下的一点朱砂。

第一卷 海棠笺
她在祖父的木匣底层找到一叠没有寄出的花笺。纸页已经泛黄，落款处却全是同一个陌生的名字。

第一章 落款
第一章 落款
午后的书铺安静得只剩翻页声。阳光穿过雕花窗棂，停在她摊开的信纸上，她蘸了朱砂，在开头写下那个名字，又停了很久，仿佛那三个字不是写在纸上，而是写回二十年前。
窗外有人挑着新鲜的栀子花经过，香气混着墨香飘进来。她忽然想起祖父临终前说过，年轻的时候总觉得一封信慢得让人发疯，后来才明白，很多人其实并不需要回信，他们只是想知道，在这个世界上曾经有人郑重地想念过自己。
她在信末落下自己的名字，再把那叠旧花笺一封封装好。傍晚的邮差经过书铺，问她寄往何处。她报出一座很远的城市，那里的人也许已经不在，那里的一条街也许早已改了名字。可风从海棠间吹过，花落在信封上。她觉得总该试一试。`, 
    css: `/* 花笺：暖象牙纸、淡胭脂和书信的克制秩序，不依赖装饰字体。 */
body {
    max-width: 36em;
    margin: 0 auto;
    padding: 0 1.25em 3em;
    background: #fffaf0;
    color: #493c37;
    font-family: serif;
    font-size: 100%;
    line-height: 1.92;
    text-align: justify;
    text-justify: inter-ideograph;
}

p {
    margin: 0.78em 0;
    line-height: 1.92;
    text-indent: 2em;
    orphans: 2;
    widows: 2;
}

img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.8em auto;
    border: 1px solid #ddc6b9;
    border-radius: 2px;
}

.opening {
    max-width: 30em;
    margin: 0 auto;
    padding: 0.25em 0.5em 2.9em;
}

h1,
h2 {
    color: #653f3a;
    font-weight: normal;
    text-indent: 0;
    overflow-wrap: break-word;
    page-break-after: avoid;
    break-after: avoid;
}

/* 部首页像信封左侧的地址栏，留出温柔而明确的起笔。 */
h1.part-title {
    margin: 4.1em 0 2.3em;
    padding: 0.25em 0 0.25em 0.85em;
    border-left: 3px solid #c98278;
    color: #70443e;
    font-size: 2.05em;
    letter-spacing: 0.16em;
    line-height: 1.65;
    text-align: left;
}

.part-number {
    display: inline-block;
    margin-bottom: 1.3em;
    color: #b8655d;
    font-size: 0.4em;
    letter-spacing: 0.38em;
    line-height: 1.5;
}

.part-name { letter-spacing: 0.19em; }
.opening--part p { color: #705d56; line-height: 1.98; }
.opening--part::after {
    content: "";
    display: block;
    width: 3.3em;
    margin: 2.8em 0 0;
    border-top: 1px solid #d9aaa1;
}

/* 卷首像一页折好的笺纸，以上下细线和居中落款区分。 */
h1.volume-title {
    margin: 4.8em 0 2.45em;
    padding: 1.05em 0;
    border-top: 1px solid #d9ada3;
    border-bottom: 1px solid #d9ada3;
    color: #6b433d;
    font-size: 1.82em;
    letter-spacing: 0.17em;
    line-height: 1.7;
    text-align: center;
}

.volume-number {
    display: inline-block;
    margin: 0 0 1.35em 0.38em;
    color: #b96760;
    font-size: 0.47em;
    letter-spacing: 0.4em;
    line-height: 1.5;
}

.volume-name { display: inline-block; font-size: 1.14em; letter-spacing: 0.24em; }
.opening--volume p { color: #705d56; line-height: 1.98; }

h2.intro-title {
    margin: 3.5em 0 1.8em;
    padding: 0 0 0.7em 0.75em;
    border-left: 2px solid #d18d83;
    border-bottom: 1px solid #ead2c8;
    color: #9b584f;
    font-size: 1.45em;
    letter-spacing: 0.3em;
    line-height: 1.55;
    text-align: left;
}

.opening--intro p { color: #705d56; line-height: 1.99; }
.opening--intro p:first-of-type { text-indent: 0; }
.opening--intro::after {
    content: "· · ·";
    display: block;
    margin-top: 2.35em;
    color: #c9857c;
    font-size: 0.85em;
    letter-spacing: 0.45em;
    text-align: center;
}

/* 章号如信笺日期，朱砂色只停留在小小一笔。 */
h2.head {
    margin: 3em 0 1.45em;
    color: #68413b;
    font-size: 1.48em;
    letter-spacing: 0.15em;
    line-height: 1.7;
    text-align: center;
}

h2.head span {
    display: inline-block;
    margin-bottom: 0.95em;
    padding: 0.22em 0.55em 0.26em;
    border-bottom: 1px solid #cc877d;
    color: #ae5e57;
    font-size: 0.62em;
    letter-spacing: 0.32em;
    line-height: 1.45;
}

h2.head::after {
    content: "";
    display: block;
    width: 2.8em;
    margin: 1em auto 0;
    border-top: 1px solid #e5c7bd;
}

.dialogue { color: #76534c; }
blockquote {
    margin: 1.5em 0;
    padding: 0.2em 0 0.2em 1em;
    border-left: 2px solid #d8a096;
    color: #856b62;
}
strong { color: #51342f; font-weight: bold; }
hr { width: 3.5em; margin: 2.8em auto; border: none; border-top: 1px solid #d9a69c; }

@media (max-width: 480px) {
    body { padding-left: 0.8em; padding-right: 0.8em; }
    h1.part-title { font-size: 1.87em; }
    h1.volume-title { font-size: 1.64em; }
}
`,
};
