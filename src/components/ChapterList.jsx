function ChapterList({ chapters, selectedIndex, onSelect}) {
    return (
        <aside className="chapter-list">
            <h2>章节目录</h2>

            {chapters.length === 0 ? (
                <p>选择TXT后显示章节</p>
            ): (
                chapters.map((chapter, index)=> (
                    <button
                        key={`${chapter.title}-${index}`}
                        type="button"
                        className={
                            index === selectedIndex
                            ? "chapter-button active"
                            : "chapter-button"
                        }
                        onClick={() => onSelect(index)}
                    >
                        {chapter.title}
                    </button>
                ))
            )}
        </aside>
    );
}

export default ChapterList;