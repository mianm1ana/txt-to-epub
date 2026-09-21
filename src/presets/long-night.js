import { parseBookSections } from "../utils/text.js";
import { createSectionXhtml } from "../utils/book-render.js";

export const longNightPreset = {
    id: "long-night-novel",
    name: "长夜",
    description: "长夜未尽，星火不熄；为那些在黑暗里仍向远方走去的人。",
    rules: [
        "自动划分简介、部、卷、章节；支持部 → 卷 → 章，也支持部下直接分章、无部或无卷的小说。",
        "支持中文章号、Chapter N、番外和完本感言；更换部时重置卷归属。",
        "支持括号标题，过滤常见正文误判，合并正文开始前连续重复的同名标题。",
        "没有标题时保留为一个正文章节；暖象牙正文与深夜底色保持清晰对比。",
    ],
    parse: parseBookSections,
    renderSection: createSectionXhtml,
    sampleText: `这是一个关于长夜与灯火的故事。世界快要熄灭的时候，总会有一些并不强大的人，站在风里，替别人把火种藏进掌心。

第一部 北山无眠
山顶的旧天文台荒废多年，圆顶生了锈，松林在夜风里起伏，像黑色的潮水一遍遍拍打山脊。

第一卷 观星人
父亲的观测簿写满了陌生星名，最后一页只有一行字：如果北方的星熄灭了，不要相信黎明还会自己来。

第一章 星火
第一章 星火
深夜，整座山忽然断了电。她点亮桌上的煤油灯，火光映在铜制望远镜上，微弱得像一颗掉进尘埃里的星。
山下的城镇也一片漆黑。很久以前，人们说北山的天文台能看见世界尽头的战争；如今战争真的越过了北方的荒原，可城里的人还是按时吃饭、睡觉、抱怨天气，仿佛那些遥远的事永远不会落到自己头上。她想起父亲守在这里的那些夜晚。他说真正可怕的不是黑暗，而是人们在黑暗里彼此松开了手。那时候她觉得这话像老人的唠叨，现在才知道，有些话要等一个人站在风口上，才会听懂。
凌晨将近，云层裂开一道缝，第一颗星从天幕深处亮起来。她推开天文台的门，寒风灌进衣领，吹得灯焰几乎熄灭；她用手护住它，望向山下无边的黑。长夜仍未结束。可总得有人先亮着。`, 
    css: `/* 长夜：克制的靛蓝夜幕，让暖象牙文字成为稳定的灯火。 */
body {
    max-width: 37em;
    margin: 0 auto;
    padding: 0 1.25em 3.2em;
    background: #101827;
    color: #f3ead5;
    font-family: serif;
    font-size: 100%;
    line-height: 1.94;
    text-align: justify;
    text-justify: inter-ideograph;
}

p {
    margin: 0.8em 0;
    line-height: 1.94;
    text-indent: 2em;
    orphans: 2;
    widows: 2;
}

img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.8em auto;
    border: 1px solid #786747;
    border-radius: 2px;
}

.opening {
    max-width: 31em;
    margin: 0 auto;
    padding: 0.3em 0.45em 3em;
}

h1,
h2 {
    color: #fff4d9;
    font-weight: normal;
    text-indent: 0;
    overflow-wrap: break-word;
    page-break-after: avoid;
    break-after: avoid;
}

/* 部首如夜航的方位标，轻微金线不干扰阅读。 */
h1.part-title {
    margin: 4.4em 0 2.2em;
    padding: 0.8em 0 0.8em 0.95em;
    border-left: 2px solid #b69a61;
    color: #fff2d4;
    font-size: 2.04em;
    letter-spacing: 0.2em;
    line-height: 1.64;
    text-align: left;
}

.part-number {
    display: inline-block;
    margin-bottom: 1.45em;
    color: #d4ba7c;
    font-size: 0.38em;
    letter-spacing: 0.42em;
    line-height: 1.5;
}

.part-name { letter-spacing: 0.2em; }
.opening--part p { color: #dfd3b9; line-height: 2; }
.opening--part::after {
    content: "✦";
    display: block;
    margin-top: 2.8em;
    color: #c5a76b;
    font-size: 0.8em;
    text-align: left;
}

/* 卷首置于细框中，像天文台的观测卡。 */
h1.volume-title {
    margin: 4.8em 0 2.5em;
    padding: 1.35em 0.7em;
    border-top: 1px solid #715f40;
    border-bottom: 1px solid #715f40;
    color: #fff0d0;
    font-size: 1.8em;
    letter-spacing: 0.18em;
    line-height: 1.7;
    text-align: center;
}

.volume-number {
    display: inline-block;
    margin: 0 0 1.35em 0.4em;
    color: #d0b171;
    font-size: 0.46em;
    letter-spacing: 0.43em;
    line-height: 1.5;
}

.volume-name { display: inline-block; font-size: 1.15em; letter-spacing: 0.24em; }
.opening--volume p { color: #dfd3b9; line-height: 2; }

h2.intro-title {
    margin: 3.6em 0 1.9em;
    padding: 0 0 0.7em;
    border-bottom: 1px solid #66573e;
    color: #e4c98f;
    font-size: 1.46em;
    letter-spacing: 0.3em;
    line-height: 1.55;
    text-align: left;
}

.opening--intro p { color: #ded2b8; line-height: 2; }
.opening--intro p:first-of-type { text-indent: 0; }
.opening--intro::after {
    content: "·  ✦  ·";
    display: block;
    margin-top: 2.4em;
    color: #b89b63;
    font-size: 0.78em;
    letter-spacing: 0.35em;
    text-align: center;
}

/* 章节使用远处星光般的微小编号，正文始终是画面的主角。 */
h2.head {
    margin: 3em 0 1.5em;
    color: #fff2d7;
    font-size: 1.48em;
    letter-spacing: 0.16em;
    line-height: 1.7;
    text-align: center;
}

h2.head span {
    display: inline-block;
    margin-bottom: 0.98em;
    color: #d6b978;
    font-size: 0.62em;
    letter-spacing: 0.38em;
    line-height: 1.45;
}

h2.head::after {
    content: "✦";
    display: block;
    margin: 0.95em auto 0;
    color: #9e895c;
    font-size: 0.55em;
}

.dialogue { color: #f4dfb7; }
blockquote {
    margin: 1.5em 0;
    padding: 0.2em 0 0.2em 1em;
    border-left: 2px solid #9b8355;
    color: #d6c9ac;
}
strong { color: #fff8e7; font-weight: bold; }
hr { width: 3.5em; margin: 2.8em auto; border: none; border-top: 1px solid #806d49; }

@media (max-width: 480px) {
    body { padding-left: 0.8em; padding-right: 0.8em; }
    h1.part-title { font-size: 1.86em; }
    h1.volume-title { font-size: 1.63em; }
}
`,
};
