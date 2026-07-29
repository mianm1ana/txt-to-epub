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

assert.match(introXhtml, /<h2>简介<\/h2>/);
assert.match(volumeXhtml, /<h1>第一卷 风起<\/h1>/);
assert.match(chapterXhtml, /<h2>第一章 初见<\/h2>/);
assert.match(
    navigation,
    /第一卷 风起<\/a><ol>[\s\S]*第一章 初见[\s\S]*第二章 离开[\s\S]*<\/ol>/,
);

console.log("简介、卷、章解析与 EPUB 结构验证通过");
