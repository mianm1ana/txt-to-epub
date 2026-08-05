import assert from "node:assert/strict";
import JSZip from "jszip";

import { createEpub } from "../src/utils/epub.js";
import { parseBookSections } from "../src/utils/text.js";

const withVolumes = `这是简介第一段
这是简介第二段

第一卷 风起
本卷说明

第一章 初见
这是第一章的正文。

第二章 离开
这是第二章的正文。

第二卷 归途
第三章 重逢
这是第三章的正文。`;

const volumeSections = parseBookSections(withVolumes);

assert.deepEqual(
    volumeSections.map((section) => section.type),
    ["intro", "volume", "chapter", "chapter", "volume", "chapter"],
);
assert.deepEqual(volumeSections[0].paragraphs, ["这是简介第一段", "这是简介第二段"]);
assert.deepEqual(volumeSections[1].paragraphs, ["本卷说明"]);
assert.equal(volumeSections[2].volumeTitle, "第一卷 风起");
assert.equal(volumeSections[5].volumeTitle, "第二卷 归途");

const withoutVolumes = parseBookSections(`无卷小说简介
第一章 开始
这是第一章的正文。
第二章 继续
这是第二章的正文。`);

assert.deepEqual(
    withoutVolumes.map((section) => section.type),
    ["intro", "chapter", "chapter"],
);
assert.equal(withoutVolumes[1].volumeTitle, "");

const bracketedVolume = parseBookSections(`书名：我不是戏神
作者：三九音域
状态：完结
评分：9.9

简介：
赤色流星划过天际后，人类文明陷入停滞。

========================================

【第一卷：戏中人】

第1章 戏鬼回家
“我……是谁？”`);

assert.deepEqual(
    bracketedVolume.map((section) => section.type),
    ["intro", "volume", "chapter"],
);
assert.equal(bracketedVolume[1].title, "【第一卷：戏中人】");
assert.equal(bracketedVolume[2].volumeTitle, "【第一卷：戏中人】");
assert.equal(bracketedVolume[2].title, "第1章 戏鬼回家");

const partAsVolume = parseBookSections(`故事简介

【第一部：戏中人】

第一章 开场
第一部电影只是正文中的普通说法

第二部 终局
第二章 落幕
正文内容`);

assert.deepEqual(
    partAsVolume.map((section) => section.type),
    ["intro", "volume", "chapter", "volume", "chapter"],
);
assert.equal(partAsVolume[1].title, "【第一部：戏中人】");
assert.equal(partAsVolume[2].volumeTitle, "【第一部：戏中人】");
assert.deepEqual(partAsVolume[2].paragraphs, [
    "第一部电影只是正文中的普通说法",
]);
assert.equal(partAsVolume[3].title, "第二部 终局");
assert.equal(partAsVolume[4].volumeTitle, "第二部 终局");

const volumeMentionsInBody = parseBookSections(`第一章 开始
这是正常正文
第五卷这个字眼只是正文内容
第5章这个字眼也只是正文内容
第二章 继续
这是第二章正文`);

assert.deepEqual(
    volumeMentionsInBody.map((section) => section.type),
    ["chapter", "chapter"],
);
assert.deepEqual(volumeMentionsInBody[0].paragraphs, [
    "这是正常正文",
    "第五卷这个字眼只是正文内容",
    "第5章这个字眼也只是正文内容",
]);

const extraChapters = parseBookSections(`第一章 正文
普通章节内容
番外一
第一篇番外内容
番外：后来
第二篇番外内容
完本感言
感谢所有读者`);

assert.deepEqual(
    extraChapters.map((section) => section.title),
    ["第一章 正文", "番外一", "番外：后来", "完本感言"],
);
assert.ok(extraChapters.every((section) => section.type === "chapter"));

const { blob: extraChapterBlob } = await createEpub({
    title: "番外测试",
    author: "测试作者",
    sections: extraChapters,
});
const extraChapterZip = await JSZip.loadAsync(await extraChapterBlob.arrayBuffer());
const extraChapterXhtml = await extraChapterZip
    .file("OEBPS/section-2.xhtml")
    .async("string");
const closingNoteXhtml = await extraChapterZip
    .file("OEBPS/section-4.xhtml")
    .async("string");

assert.match(
    extraChapterXhtml,
    /<h2 class="head"><span>番外一<\/span><\/h2>/,
);
assert.match(
    closingNoteXhtml,
    /<h2 class="head"><span>完本感言<\/span><\/h2>/,
);

const withoutHeadings = parseBookSections("只有正文第一段\n只有正文第二段");
assert.deepEqual(withoutHeadings, [{
    type: "chapter",
    title: "正文",
    volumeTitle: "",
    paragraphs: ["只有正文第一段", "只有正文第二段"],
}]);

const { blob, chapterCount, volumeCount } = await createEpub({
    title: "结构测试",
    author: "测试作者",
    sections: volumeSections,
});

assert.equal(chapterCount, 3);
assert.equal(volumeCount, 2);

const zip = await JSZip.loadAsync(await blob.arrayBuffer());
const introXhtml = await zip.file("OEBPS/section-1.xhtml").async("string");
const volumeXhtml = await zip.file("OEBPS/section-2.xhtml").async("string");
const chapterXhtml = await zip.file("OEBPS/section-3.xhtml").async("string");
const navigation = await zip.file("OEBPS/nav.xhtml").async("string");
const stylesheet = await zip.file("OEBPS/style.css").async("string");

assert.match(introXhtml, /<h2>简介<\/h2>/);
assert.match(volumeXhtml, /<h1 class="volume-title">第一卷 风起<\/h1>/);
assert.match(
    chapterXhtml,
    /<h2 class="head"><span>第一章<\/span><br\/>初见<\/h2>/,
);
assert.match(
    navigation,
    /第一卷 风起<\/a><ol>[\s\S]*第一章 初见[\s\S]*第二章 离开[\s\S]*<\/ol>/,
);
assert.match(stylesheet, /body\s*{[\s\S]*text-align:\s*justify;/);
assert.match(stylesheet, /p\s*{[\s\S]*text-indent:\s*2em;/);
assert.match(stylesheet, /h1\.volume-title\s*{[\s\S]*border-top:/);
assert.match(stylesheet, /h2\.head span\s*{[\s\S]*background-color:\s*#8b3a3a;/);

console.log("简介、卷、章解析与 EPUB 结构验证通过");
