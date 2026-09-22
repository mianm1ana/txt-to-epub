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
            ) : <div className="reading-empty"><span className="empty-number" aria-hidden="true">Aa</span><h2>下一页，是你的故事。</h2><p>选择 TXT 并生成 EPUB 后，<br />在目录中挑一章查看实际排版。</p></div>}
        </section>
    );
}

export default ChapterPreview;
