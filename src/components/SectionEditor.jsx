import { useState } from 'react';

export default function SectionEditor({ section, previous, disabled, onSave, onMerge, onUndo, canUndo }) {
    const [title, setTitle] = useState(section.title);
    const [type, setType] = useState(section.type);
    const dirty = title !== section.title || type !== section.type;
    return (
        <form className="section-editor" onSubmit={event => { event.preventDefault(); if (title.trim()) onSave({ title, type }); }}>
            <div className="editor-heading"><h3>章节纠错</h3><span>修改后重新生成 EPUB</span></div>
            <div className="editor-fields">
                <label className="field"><span>当前标题</span><input value={title} disabled={disabled} onChange={event => setTitle(event.target.value)} required /></label>
                <label className="field"><span>内容类型</span><select value={type} disabled={disabled} onChange={event => setType(event.target.value)}><option value="intro">简介</option><option value="volume">卷 / 部</option><option value="chapter">章节</option></select></label>
            </div>
            <div className="editor-actions">
                <button className="convert-button" disabled={disabled || !dirty || !title.trim()} type="submit">应用修改</button>
                <button className="download-button" disabled={disabled || !previous || dirty} type="button" onClick={onMerge}>合并到上一项</button>
                <button className="download-button" disabled={disabled || !canUndo || dirty} type="button" onClick={onUndo}>撤销上次修改</button>
            </div>
            <p className="cover-hint" role="status">{dirty ? '有尚未应用的修改。点击“应用修改”后才会用于预览和导出。' : previous ? `合并至「${previous.title}」：当前标题将保留为正文段落，内容不会丢失。` : '第一项不能向前合并。可修改标题或内容类型。'} 切换章节会放弃未应用的输入。</p>
        </form>
    );
}
