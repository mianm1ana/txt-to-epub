import { buildHierarchy } from '../utils/hierarchy.js';

function ChapterList({ sections, selectedIndex, onSelect }) {
    return (
        <aside className="chapter-list">
            <div className="contents-heading"><span className="eyebrow">CONTENTS</span><h2>章节目录 <span>{String(sections.length).padStart(2, "0")}</span></h2></div>

            {sections.length === 0 ? (
                <div className="contents-empty"><i className="fa-solid fa-list-ul" aria-hidden="true" /><p>目录静候故事</p><small>选择原稿并生成 EPUB 后，<br />在这里浏览章节。</small></div>
            ): (
                buildHierarchy(sections).map(({ section, index, depth }) => (
                    <button
                        key={`${section.type}-${section.title}-${index}`}
                        type="button"
                        className={[
                            "chapter-button",
                            `chapter-button--${section.type}`,
                            `chapter-button--depth-${depth}`,
                            index === selectedIndex ? "active" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => onSelect(index)}
                        aria-current={index === selectedIndex ? 'true' : undefined}
                        title={section.title}
                    >
                        {section.title}
                    </button>
                ))
            )}
        </aside>
    );
}

export default ChapterList;
