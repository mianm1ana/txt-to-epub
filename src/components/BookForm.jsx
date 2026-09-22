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
    statusTone,
    onFileChange,
    onEncodingChange,
    onTitleChange,
    onAuthorChange,
    onGenerate,
    onDownload
}) {
    return (
        <form className="form" onSubmit={onGenerate}>
            <div className="form-section-heading"><span className="section-number" aria-hidden="true">01</span><div><h2>放入原稿</h2><p>从原始文本到可校样的书稿</p></div></div>
            <fieldset className="form-group">
                <legend className="group-label">原稿设置</legend>
                <label className="field upload-field">
                    <span>TXT 文件</span>
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
                    <span>生成预设</span>
                    <select value={presetId} disabled={converting} onChange={(event) => onPresetChange(event.target.value)} aria-describedby="preset-description">
                        {PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
                    </select>
                </label>
                <p className="cover-hint" id="preset-description">{getPreset(presetId).description}</p>
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
            </fieldset>

            <fieldset className="form-group">
                <legend className="group-label">书籍署名</legend>
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
            </fieldset>

            <details className="cover-field" open={Boolean(cover || coverLoading || coverError)}>
                <summary className="group-label"><span>封面（可选）</span><small>添加图片 <i className="fa-solid fa-chevron-down" aria-hidden="true" /></small></summary>
                <div className="cover-content">
                    <label className="field cover-upload">
                        <span>封面图片</span>
                        <span className="cover-upload-prompt"><i className="fa-solid fa-image" aria-hidden="true" /><strong>选择封面图片</strong><small>JPG / PNG · 最大 10 MB</small></span>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            disabled={converting || coverLoading}
                            onChange={onCoverChange}
                            aria-describedby="cover-hint"
                        />
                    </label>
                    <p id="cover-hint" className="cover-hint">建议使用竖版图片；导出时将保留原始比例。</p>
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
            </details>

            <div className="form-actions">
                <button
                    className={`convert-button ${converting ? "is-loading" : ""}`}
                    type="submit"
                    disabled={converting || !canGenerate}
                    aria-busy={converting}
                >
                    <span>{converting ? "正在解析并生成..." : "开始制作 EPUB"}</span> <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>

                <button
                    className="download-button"
                    type="button"
                    disabled={converting || !canDownload}
                    onClick={onDownload}
                >
                    <i className="fa-solid fa-arrow-down" aria-hidden="true" /> 下载已完成的书
                </button>
                <div className={`status status--${statusTone}`} role={statusTone === "error" ? "alert" : "status"} aria-live="polite">
                    {status || "等待原稿：选择一个 TXT 文件开始。"}
                </div>
            </div>
        </form>
    );
}

export default BookForm;
