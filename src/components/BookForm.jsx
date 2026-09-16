import { PRESETS, getPreset } from "../presets/index.js";

function BookForm({
    fileName,
    presetId,
    onPresetChange,
    cover,
    coverLoading,
    coverError,
    onCoverChange,
    onRemoveCover,
    title,
    author,
    encoding,
    converting,
    canGenerate,
    canDownload,
    status,
    onFileChange,
    onEncodingChange,
    onTitleChange,
    onAuthorChange,
    onGenerate,
    onDownload
}) {
    return (
        <form className="form" onSubmit={onGenerate}>
            <div className="form-section-heading"><span className="section-number">01</span><div><h2>装订之前</h2><p>MAKE IT YOURS</p></div></div>
            <div>
                <label className="field">
                    <span>生成预设</span>
                    <select value={presetId} disabled={converting} onChange={(event) => onPresetChange(event.target.value)} aria-describedby="preset-description">
                        {PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
                    </select>
                </label>
                <p className="cover-hint" id="preset-description">{getPreset(presetId).description}</p>
            </div>
            <label className="field upload-field">
                <span>TXT文件</span>
                <span className="upload-prompt"><i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" /><strong>{fileName || "选择你的原稿"}</strong><small>{fileName ? "点击更换 TXT 文件" : "TXT 格式 · 点击选择文件"}</small></span>

                <input
                    type="file"
                    accept=".txt,text/plain"
                    aria-label="TXT文件"
                    disabled={converting}
                    onChange={onFileChange}
                />
            </label>

            <label className="field">
                <span>文本编码</span>

                <select
                    value={encoding}
                    disabled={converting}
                    onChange={onEncodingChange}
                >
                    <option value="auto">自动检测</option>
                    <option value="utf-8">UTF-8</option>
                    <option value="gb18030">GBK / GB18030</option>
                </select>
            </label>

            <label className="field">
                <span>书名</span>

                <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                        onTitleChange(event.target.value);
                    }} 
                    placeholder="请输入书名"
                />
            </label>

            <label className="field">
                <span>作者</span>

                <input
                    type="text"
                    value={author}
                    onChange={(event) => {
                        onAuthorChange(event.target.value);
                    }}
                    placeholder="请输入作者名"
                />
            </label>

            <div className="cover-field">
                <label className="field">
                    <span>封面（可选）</span>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        disabled={converting || coverLoading}
                        onChange={onCoverChange}
                        aria-describedby="cover-hint"
                    />
                </label>
                <p id="cover-hint" className="cover-hint">支持 JPG / PNG，最大 10 MB，建议使用竖版图片。</p>
                {coverLoading && <p role="status">正在读取封面...</p>}
                {coverError && <p className="cover-error" role="alert">{coverError}</p>}
                {cover && (
                    <div className="cover-preview">
                        <img src={cover.previewUrl} alt="所选书籍封面预览" />
                        <p>{cover.name}</p>
                        <button type="button" className="download-button" disabled={converting || coverLoading} onClick={onRemoveCover}>移除封面</button>
                    </div>
                )}
            </div>

            <button
                className="convert-button"
                type="submit"
                disabled={converting || !canGenerate}
            >
                {converting ? "正在解析并生成..." : "生成EPUB"} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>

            <button
                className="download-button"
                type="button"
                disabled={converting || !canDownload}
                onClick={onDownload}
            >
                <i className="fa-solid fa-arrow-down" aria-hidden="true" /> 下载EPUB
            </button>

            <div className="status" aria-live="polite">
                {status || "请选择一个TXT文件"}
            </div>
        </form>
    );
}

export default BookForm;
