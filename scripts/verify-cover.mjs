import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { createEpub } from '../src/utils/epub.js';
import { identifyCover, MAX_COVER_SIZE, readCover } from '../src/utils/cover.js';

const book = { title: '书名<&"', author: '作者', sections: [{ type: 'chapter', title: '第一章 开始', paragraphs: ['正文'] }] };
const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9S8AAAAASUVORK5CYII=', 'base64'));
// Packaging preserves bytes; browser decode validation is exercised separately.
const jpeg = new Uint8Array([255, 216, 255, 224, 0, 2, 255, 217]);
for (const [data, extension, mediaType] of [[png, 'png', 'image/png'], [jpeg, 'jpg', 'image/jpeg']]) {
  assert.deepEqual(identifyCover(data), { extension, mediaType });
  const result = await createEpub({ ...book, cover: { data } });
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  assert.deepEqual(await zip.file(`OEBPS/images/cover.${extension}`).async('uint8array'), data);
  const opf = await zip.file('OEBPS/content.opf').async('string');
  assert.match(opf, /properties="cover-image"/);
  assert.match(opf, /<meta name="cover" content="cover-image"\/>/);
  assert.match(opf, /<spine>\s*<itemref idref="cover-page"\/>\s*<itemref idref="section-1"\/>/);
  assert.ok(opf.includes(`media-type="${mediaType}"`));
  const page = await zip.file('OEBPS/cover.xhtml').async('string');
  assert.ok(page.includes(`src="images/cover.${extension}"`));
  assert.match(page, /书名&lt;&amp;&quot;/);
  assert.match(await zip.file('OEBPS/nav.xhtml').async('string'), /epub:type="cover" href="cover.xhtml"/);
  assert.equal(result.chapterCount, 1);
  const bytes = new Uint8Array(await result.blob.arrayBuffer());
  assert.equal(new DataView(bytes.buffer).getUint16(8, true), 0);
  assert.equal(new TextDecoder().decode(bytes.slice(30, 38)), 'mimetype');
}
for (const cover of [undefined, null]) {
  const result = await createEpub({ ...book, cover });
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  assert.equal(zip.file('OEBPS/cover.xhtml'), null);
  assert.doesNotMatch(await zip.file('OEBPS/content.opf').async('string'), /cover-image|cover-page|name="cover"/);
  assert.match(await zip.file('OEBPS/content.opf').async('string'), /<spine>\s*<itemref idref="section-1"/);
}
assert.throws(() => identifyCover(new Uint8Array()), /不能为空/);
assert.throws(() => identifyCover(new Uint8Array(MAX_COVER_SIZE + 1)), /10 MB/);
assert.throws(() => identifyCover(new Uint8Array([71, 73, 70])), /JPG 或 PNG/);
await assert.rejects(readCover({ size: MAX_COVER_SIZE + 1 }), /10 MB/);
await assert.rejects(createEpub({ ...book, cover: { data: new Uint8Array([1]) } }), /JPG 或 PNG/);
await assert.rejects(createEpub({ ...book, sections: [], cover: { data: png } }), /没有可转换/);
console.log('Cover packaging, validation, ordering and optional-cover regression checks passed.');
