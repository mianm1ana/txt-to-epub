function ChapterList({ sections, selectedIndex, onSelect }) {
    return (
        <aside className="chapter-list">
            <div className="contents-heading"><span className="eyebrow">CONTENTS</span><h2>章节目录 <span>{String(sections.length).padStart(2, "0")}</span></h2></div>

            {sections.length === 0 ? (
                <div className="contents-empty"><i className="fa-solid fa-list-ul" aria-hidden="true" /><p>目录静候故事</p><small>选择原稿并生成 EPUB 后，<br />在这里浏览章节。</small></div>
            ): (
                sections.map((section, index) => (
                    <button
                        key={`${section.type}-${section.title}-${index}`}
                        type="button"
                        className={[
                            "chapter-button",
                            `chapter-button--${section.type}`,
                            section.type === "chapter" && section.volumeTitle
                                ? "chapter-button--nested"
                                : "",
                            index === selectedIndex ? "active" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => onSelect(index)}
                    >
                        {section.title}
                    </button>
                ))
            )}
        </aside>
    );
}

export default ChapterList;
