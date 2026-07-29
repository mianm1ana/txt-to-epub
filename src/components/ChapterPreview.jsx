function ChapterPreview({chapter}) {
    return (
        <section className="chapter-preview">
            {chapter ? (
                <>
                    <h2>{chapter.title}</h2>

                    <div className="chapter-content">
                        {chapter.paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </>
            ):(
                <p>暂无章节内容</p>
            )}
        </section>
    );
}

export default ChapterPreview;