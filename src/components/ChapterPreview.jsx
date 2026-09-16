import { createPreviewDocument } from '../presets/index.js';

function ChapterPreview({ section, presetId }) {
    return (
        <section className="chapter-preview">
            {section ? (
                <iframe
                    className="chapter-preview-frame"
                    title={`章节排版预览：${section.title}`}
                    sandbox=""
                    srcDoc={createPreviewDocument(section, presetId)}
                />
            ) : <div className="reading-empty"><span className="empty-number">Aa</span><h2>下一页，是你的故事。</h2><p>生成 EPUB 后，在左侧选择章节<br />即可查看实际排版。</p><span className="eyebrow">YOUR WORDS, BEAUTIFULLY BOUND.</span></div>}
        </section>
    );
}

export default ChapterPreview;
