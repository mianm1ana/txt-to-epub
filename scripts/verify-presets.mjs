import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { PRESETS, DEFAULT_PRESET_ID, getPreset, createPreviewDocument } from '../src/presets/index.js';
import { createEpub } from '../src/utils/epub.js';
import { parseBookSections } from '../src/utils/text.js';

assert.equal(new Set(PRESETS.map(p => p.id)).size, PRESETS.length);
assert.equal(getPreset().id, DEFAULT_PRESET_ID);
assert.throws(() => getPreset('missing'), /找不到生成预设/);
for (const preset of PRESETS) {
    const sections = preset.parse(preset.sampleText);
    assert.deepEqual(sections.map(s => s.type), ['intro', 'volume', 'chapter']);
    assert.deepEqual(sections, parseBookSections(preset.sampleText));
    assert.equal(sections[2].paragraphs.length, 3);
    const book = { title: '预设测试', sections, presetId: preset.id };
    const { blob } = await createEpub(book);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    assert.equal(await zip.file('OEBPS/style.css').async('string'), preset.css);
    for (const [i, section] of sections.entries()) {
        assert.equal(await zip.file(`OEBPS/section-${i + 1}.xhtml`).async('string'), preset.renderSection(section, i));
        const preview = createPreviewDocument(section, preset.id);
        assert.ok(preview.includes(`<style>${preset.css}</style>`));
        assert.equal(preview.replace(`<style>${preset.css}</style>`, '<link rel="stylesheet" type="text/css" href="style.css"/>'), preset.renderSection(section, 0));
    }
    assert.match(createPreviewDocument(sections[1], preset.id), /class="volume-title"/);
    assert.match(createPreviewDocument(sections[2], preset.id), /<span>第一章<\/span>/);
    const unsafe = { type: 'chapter', title: '<script>标题</script>', paragraphs: ['<img onerror="alert(1)"> & 正文'] };
    const preview = createPreviewDocument(unsafe, preset.id);
    assert.doesNotMatch(preview, /<script>|<img onerror/);
    assert.match(preview, /&lt;img onerror=/);
}
const sections = getPreset().parse('第一章 开始\n测试正文');
const implicit = await createEpub({ title: '默认', sections });
const explicit = await createEpub({ title: '默认', sections, presetId: DEFAULT_PRESET_ID });
const a = await JSZip.loadAsync(await implicit.blob.arrayBuffer());
const b = await JSZip.loadAsync(await explicit.blob.arrayBuffer());
for (const path of ['OEBPS/style.css', 'OEBPS/section-1.xhtml', 'OEBPS/nav.xhtml']) {
    assert.equal(await a.file(path).async('string'), await b.file(path).async('string'));
}
await assert.rejects(createEpub({ title: '测试', sections, presetId: 'missing' }), /找不到生成预设/);
console.log('预设注册、解析、默认兼容、排版预览与导出一致性验证通过');
