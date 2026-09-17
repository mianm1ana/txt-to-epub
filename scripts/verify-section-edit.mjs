import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { editSection, mergeWithPrevious } from '../src/utils/section-edit.js';
import { createEpub } from '../src/utils/epub.js';
const original = [
  { type: 'volume', title: '第一卷', paragraphs: [], volumeTitle: '' },
  { type: 'chapter', title: '第一章', paragraphs: ['甲'], volumeTitle: '第一卷' },
  { type: 'chapter', title: '误拆标题', paragraphs: ['乙'], volumeTitle: '第一卷' },
  { type: 'volume', title: '第二卷', paragraphs: [], volumeTitle: '' },
  { type: 'chapter', title: '第二章', paragraphs: ['丙'], volumeTitle: '第二卷' },
];
const snapshot = JSON.stringify(original);
const renamed = editSection(original, 0, { title: '新卷<&', type: 'volume' });
assert.equal(renamed[1].volumeTitle, '新卷<&');
assert.equal(renamed[4].volumeTitle, '第二卷');
const merged = mergeWithPrevious(renamed, 2);
assert.deepEqual(merged[1].paragraphs, ['甲', '误拆标题', '乙']);
assert.equal(merged.length, 4);
assert.equal(JSON.stringify(original), snapshot);
const intro = editSection(original, 0, { title: '简介', type: 'intro' });
assert.equal(intro[1].volumeTitle, '');
const promoted = editSection(original, 1, { title: '新卷', type: 'volume' });
assert.equal(promoted[2].volumeTitle, '新卷');
const demoted = editSection(original, 3, { title: '普通章', type: 'chapter' });
assert.equal(demoted[4].volumeTitle, '第一卷');
assert.equal(mergeWithPrevious(original, 3)[3].volumeTitle, '第一卷');
assert.throws(() => mergeWithPrevious(original, 0));
assert.throws(() => editSection(original, 1, { title: ' ', type: 'chapter' }));
assert.throws(() => editSection(original, 1, { title: '标题', type: 'bad' }));
const { blob, chapterCount } = await createEpub({ title: '纠错测试', sections: merged });
assert.equal(chapterCount, 2);
const zip = await JSZip.loadAsync(await blob.arrayBuffer());
const nav = await zip.file('OEBPS/nav.xhtml').async('string');
assert.ok(nav.includes('新卷&lt;&amp;'));
assert.ok(!nav.includes('误拆标题'));
const chapter = await zip.file('OEBPS/section-2.xhtml').async('string');
assert.ok(chapter.includes('<p>甲</p>\n<p>误拆标题</p>\n<p>乙</p>'));
console.log('章节改名、类型、卷归属、合并保留内容及 EPUB 导出验证通过');
