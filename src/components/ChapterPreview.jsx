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
            ) : <div className="reading-empty"><span className="empty-number" aria-hidden="true">Aa</span><h2>下一页，是你的故事。</h2><p>生成后在目录中选章预览</p></div>}
        </section>
    );
}

export default ChapterPreview;
