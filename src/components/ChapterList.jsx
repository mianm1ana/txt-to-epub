function ChapterList({ sections, selectedIndex, onSelect }) {
    return (
        <aside className="chapter-list">
            <h2>章节目录</h2>

            {sections.length === 0 ? (
                <p>选择TXT后显示章节</p>
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
