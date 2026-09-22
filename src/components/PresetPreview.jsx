import { useState } from 'react';
import { createPreviewDocument, getPreset } from '../presets/index.js';

function PresetPreview({ presetId, hasBook }) {
    const [sampleIndex, setSampleIndex] = useState(3);
    const [sampleState, setSampleState] = useState({ hasBook, expanded: !hasBook });
    const preset = getPreset(presetId);
    const samples = preset.parse(preset.sampleText);
    const selectedIndex = Math.min(sampleIndex, samples.length - 1);
    const labels = { intro: '简介', part: '部首页', volume: '卷首', chapter: '章节正文' };

    const sampleExpanded = sampleState.hasBook === hasBook ? sampleState.expanded : !hasBook;

    return (
        <section className="preset-preview" aria-label="排版预设预览">
            <div className="preset-preview-heading">
                <div>
                    <h2><span className="section-index" aria-hidden="true">02</span>{preset.name}<span className="preset-tag">排版预设</span></h2>
                    <p>无需上传文件即可查看。示例与导出共用排版，阅读器的字体和分页可能略有不同。</p>
                </div>
                <label className="field">
                    <span>示例页面</span>
                    <select value={selectedIndex} onChange={(event) => setSampleIndex(Number(event.target.value))}>
                        {samples.map((section, index) => <option value={index} key={index}>{labels[section.type]} · {section.title}</option>)}
                    </select>
                </label>
            </div>
            <button className="sample-toggle" type="button" onClick={() => setSampleState({ hasBook, expanded: !sampleExpanded })} aria-expanded={sampleExpanded} aria-controls="sample-body">
                <span>排版样张</span><span>{sampleExpanded ? '收起' : '展开'} <i className="fa-solid fa-chevron-down" aria-hidden="true" /></span>
            </button>
            <div className="sample-body" id="sample-body" hidden={!sampleExpanded}>
                <div className="paper-stage">
                    <div className="paper-caption"><span>排版样张 / SPECIMEN</span><span>{String(selectedIndex + 1).padStart(2, '0')} / {String(samples.length).padStart(2, '0')}</span></div>
                    <iframe
                        className="preset-sample-frame"
                        title={`${preset.name}排版示例`}
                        sandbox=""
                        srcDoc={createPreviewDocument(samples[selectedIndex], presetId)}
                    />
                    <div className="paper-bottom">{preset.name} <span>·</span> 为长篇阅读而设计</div>
                </div>
                <details className="preset-rules">
                    <summary>查看 TXT 划分规则与示例原文</summary>
                    <ul>{preset.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                    <pre>{preset.sampleText}</pre>
                </details>
            </div>
        </section>
    );
}

export default PresetPreview;
