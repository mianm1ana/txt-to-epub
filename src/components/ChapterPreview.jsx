function ChapterPreview({ section }) {
    const Heading = section?.type === "volume" ? "h1" : "h2";

    return (
        <section className="chapter-preview">
            {section ? (
                <>
                    <Heading>{section.title}</Heading>

                    <div className="chapter-content">
                        {section.paragraphs.map((paragraph, index) => (
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
