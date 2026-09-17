import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { parseBookSections } from '../src/utils/text.js';
import { buildHierarchy } from '../src/utils/hierarchy.js';
import { editSection, mergeWithPrevious } from '../src/utils/section-edit.js';
import { createEpub } from '../src/utils/epub.js';

const sections = parseBookSections(await readFile(new URL('./fixtures/three-level-book.txt', import.meta.url), 'utf8'));
const hierarchy = buildHierarchy(sections);
assert.deepEqual(sections.map(s => s.type), ['intro', 'part', 'volume', 'chapter', 'volume', 'chapter', 'part', 'chapter', 'volume', 'chapter']);
const parents = [null, null, 1, 2, 1, 4, null, 6, 6, 8];
assert.deepEqual(hierarchy.map(e => e.parentIndex), parents);
assert.deepEqual(hierarchy.map(e => e.depth), [0, 0, 1, 2, 1, 2, 0, 1, 1, 2]);
assert.equal(sections[7].volumeTitle, '');
assert.equal(sections[9].partTitle, '第二部 归途');
assert.equal(sections[3].partTitle, '【第一部：山河】');
assert.equal(sections[2].volumeTitle, '');
assert.deepEqual(sections[1].paragraphs, ['部的开场说明。']);

const changed = editSection(sections, 6, { type: 'part', title: '新部<&' });
assert.equal(changed[9].partTitle, '新部<&');
assert.equal(changed[3].partTitle, sections[1].title);
const demoted = editSection(sections, 6, { type: 'volume', title: '新卷' });
assert.equal(demoted[7].partTitle, sections[1].title);
assert.equal(demoted[7].volumeTitle, '新卷');
const reset = editSection(sections, 6, { type: 'intro', title: '补充简介' });
assert.equal(reset[7].partTitle, '');
assert.equal(reset[7].volumeTitle, '');
assert.equal(reset[9].partTitle, '');
const promoted = editSection(sections, 4, { type: 'part', title: '新部' });
assert.equal(promoted[5].partTitle, '新部');
assert.equal(promoted[5].volumeTitle, '');
const merged = mergeWithPrevious(sections, 6);
assert.equal(merged[6].partTitle, sections[1].title);
assert.equal(merged[6].volumeTitle, '第二卷 风起');
assert.ok(merged[5].paragraphs.includes('第二部 归途'));
assert.equal(sections[7].partTitle, '第二部 归途');

const special = parseBookSections('第一部\n第一部电影是正文。\n第一卷 第一部的故事\n第一章\n正文');
assert.deepEqual(special.map(s => s.type), ['part', 'volume', 'chapter']);
assert.deepEqual(special[0].paragraphs, ['第一部电影是正文。']);
for (const text of ['第一章\n正文', '第一卷\n第一章\n正文', '第一部\n第一章\n正文', '第一部\n第二部\n第一卷']) {
    assert.ok(parseBookSections(text).length > 0);
}

const { blob, partCount, volumeCount, chapterCount } = await createEpub({ title: '三级目录测试', sections: changed });
assert.deepEqual([partCount, volumeCount, chapterCount], [2, 3, 4]);
const zip = await JSZip.loadAsync(await blob.arrayBuffer());
const nav = await zip.file('OEBPS/nav.xhtml').async('string');
// Read actual nested <li> ancestry in exported navigation, using section IDs.
const stack = [];
const actualParents = [];
for (const token of nav.matchAll(/<li>|<\/li>|<a href="section-(\d+)\.xhtml"/g)) {
    if (token[0] === '<li>') stack.push(null);
    else if (token[0] === '</li>') stack.pop();
    else {
        const index = Number(token[1]) - 1;
        actualParents[index] = stack.length > 1 ? stack.at(-2) : null;
        stack[stack.length - 1] = index;
    }
}
assert.deepEqual(actualParents, parents);
assert.ok(nav.includes('新部&lt;&amp;'));
assert.match(await zip.file('OEBPS/section-2.xhtml').async('string'), /class="part-title"/);
assert.match(await zip.file('OEBPS/section-3.xhtml').async('string'), /class="volume-title"/);
const opf = await zip.file('OEBPS/content.opf').async('string');
assert.deepEqual([...opf.matchAll(/<itemref idref="section-(\d+)"/g)].map(m => Number(m[1])), sections.map((_, i) => i + 1));
console.log('三级解析、缺省层级、重复名称、纠错与导出嵌套关系验证通过');
