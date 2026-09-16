import { useEffect, useState } from 'react'

import { readCover } from "./utils/cover";

import { createEpub } from "./utils/epub"
import { decodeTxtFile } from "./utils/text";
import { downloadBlob, safeFilename } from "./utils/download"

import ChapterList from "./components/ChapterList"
import ChapterPreview from './components/ChapterPreview';
import BookForm from './components/BookForm';

import './App.css';
import { DEFAULT_PRESET_ID, getPreset } from './presets/index.js';
import PresetPreview from './components/PresetPreview';



function App() {
  // --- 页面状态 ---
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [encoding, setEncoding] = useState("auto"); // 文本编码：auto / utf-8 / gb18030
  const [sections, setSections] = useState([]); // 解析出来的简介、卷和章节
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0); // 当前查看的是哪一项
  const [epubBlob, setEpubBlob] = useState(null); // 生成好的 EPUB 文件
  const [status, setStatus] = useState(""); // 底部状态提示文案
  const [converting, setConverting] = useState(false); // 是否正在生成 EPUB（用来禁用按钮、显示“正在转换...”）

  const [cover, setCover] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState("");

  useEffect(() => {
    return () => {
      if (cover) URL.revokeObjectURL(cover.previewUrl);
    };
  }, [cover]);

  function handlePresetChange(nextId) {
    if (nextId === presetId) return;
    setPresetId(nextId);
    setSections([]);
    setSelectedSectionIndex(0);
    setEpubBlob(null);
    setStatus("生成预设已更改，请重新生成 EPUB");
  }

  async function handleCoverChange(event) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setCoverLoading(true);
    setCoverError("");
    try {
      const nextCover = await readCover(selected);
      setCover(nextCover);
      setEpubBlob(null);
      setStatus("封面已更新，点击“生成 EPUB”应用封面");
    } catch (error) {
      setCoverError(error.message);
    } finally {
      setCoverLoading(false);
    }
  }

  function handleRemoveCover() {
    setCover(null);
    setCoverError("");
    setEpubBlob(null);
    setStatus("封面已移除，请重新生成 EPUB");
  }

  /**
   * 文件选择框变化时触发
   * 1. 保存File
   * 2. 如果书名还是空的,用文件名(去掉.txt)当默认书名
   * 3. 清空旧结果，等待用户点击“生成 EPUB”
   */
  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setFile(null);
      setSections([]);
      setEpubBlob(null);
      setStatus("请选择 .txt 文件");
      return;
    }

    setFile(selectedFile);
    setSections([]);
    setSelectedSectionIndex(0);
    setEpubBlob(null);

    // 如果书名还是空的,自动用文件名填充
    if (!title) {
      setTitle(selectedFile.name.replace(/\.txt$/i, ""));
    }

    setStatus(`已选择 ${selectedFile.name}，点击“生成 EPUB”开始解析`);
  }

  /**
   * 编码下拉框变化时触发
   * 如果已经选过文件，只让旧解析结果失效，不自动重新解析
   */
  function handleEncodingChange(event) {
    const nextEncoding = event.target.value;
    setEncoding(nextEncoding);

    if (file) {
      setSections([]);
      setSelectedSectionIndex(0);
      setEpubBlob(null);
      setStatus("文本编码已更改，点击“生成 EPUB”重新解析");
    }
  }

  /**
   * 点击生成epub或表单提交时触发
   * 真正调用createEpub,然后用浏览器下载
   */
  async function handleGenerate(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    if (coverLoading || converting) return;

    if (!file) {
      setStatus("请先选择TXT文件");
      return;
    }

    setConverting(true);
    setEpubBlob(null);
    setStatus("正在解析 TXT 并生成 EPUB...");

    try {
      const decodedText = await decodeTxtFile(file, encoding);
      const parsedSections = getPreset(presetId).parse(decodedText);

      if (parsedSections.length === 0) {
        throw new Error("TXT 文件没有可转换的内容");
      }

      setSections(parsedSections);
      setSelectedSectionIndex(0);

      // 书名兜底: 没填就用文件名
      const bookTitle =
        title.trim() || file.name.replace(/\.txt$/i, "");
      
      // 核心: 生成EPUB Blob + 章节数
      const { blob, chapterCount, volumeCount } = await createEpub({
        title: bookTitle,
        author: author.trim() || "未知作者",
        sections: parsedSections,
        cover,
        presetId,
      });

      setEpubBlob(blob); // 保存生成的EPUB Blob对象,方便预览或下载
      setStatus(`EPUB 生成成功（${getPreset(presetId).name}），共 ${volumeCount} 卷、${chapterCount} 章`);
    }catch (error) {
      console.error(error);
      setStatus(`生成EPUB失败: ${error.message}`);
    }finally {
      setConverting(false);
    }
  }
      
  /**
   * 下载
   */

  function handleDownload() {
    if (!epubBlob) {
      setStatus("请先生成EPUB");
      return;
    }

    const bookTitle = title.trim() || file?.name.replace(/\.txt$/i, "") || "book";

    downloadBlob(
      epubBlob,
      `${safeFilename(bookTitle)}.epub`,
    )
  }

  const selectedSection = sections[selectedSectionIndex];

  // --- 界面 ---
  return (
    <main className="page">
      <nav className="masthead" aria-label="品牌信息">
        <a className="brand" href="#"><i className="fa-solid fa-book-open" aria-hidden="true" /> 纸间 <span> / PAPERWORK</span></a>
        <span className="local-badge"><span className="live-dot" /> 本地运行 · 文件不上传</span>
      </nav>
      <header className="header">
        <div>
          <p className="eyebrow">A SMALL WORKSHOP FOR BIG STORIES</p>
          <h1>让文字，<br />成为<span>一本书。</span></h1>
          <p className="hero-description">从纯文本到掌中书。整理章节、挑选排版，<br className="desktop-break" />为值得收藏的故事，做一本自己的电子书。</p>
        </div>
        <div className="format-mark" aria-label="TXT 转 EPUB">
          <span className="eyebrow">PLAIN TEXT. WELL DRESSED.</span>
          <div>TXT <i className="fa-solid fa-arrow-right-long" aria-hidden="true" /></div>
          <strong>EPUB<span>3.0</span></strong>
          <p>你的文字，你的书架。</p>
        </div>
      </header>
      <div className="workbench-heading"><span><i className="fa-solid fa-sliders" aria-hidden="true" /> 制书工作台</span><span>01 / 配置 &nbsp; → &nbsp; 02 / 预览 &nbsp; → &nbsp; 03 / 导出</span></div>

      <div className="workspace">
        {/* 左侧：表单操作区 */}
        <BookForm
          fileName={file?.name}
          presetId={presetId}
          onPresetChange={handlePresetChange}
          title={title}
          author={author}
          encoding={encoding}
          converting={converting}
          cover={cover}
          coverLoading={coverLoading}
          coverError={coverError}
          onCoverChange={handleCoverChange}
          onRemoveCover={handleRemoveCover}
          canGenerate={Boolean(file) && !coverLoading}
          canDownload={Boolean(epubBlob) && !coverLoading}
          status={status}
          onFileChange={handleFileChange}
          onEncodingChange={handleEncodingChange}
          onTitleChange={setTitle}
          onAuthorChange={setAuthor}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
        />
        
        <div className="reading-workspace">
          <PresetPreview key={presetId} presetId={presetId} />
          <section className="chapter-workspace">
            <ChapterList
              sections={sections}
              selectedIndex={selectedSectionIndex}
              onSelect={setSelectedSectionIndex}
            />
            <ChapterPreview section={selectedSection} presetId={presetId} />
          </section>
        </div>
      </div>
      <footer className="footer"><span>纸间 / PAPERWORK</span><p>好故事，值得好好排版。</p><span>TXT → EPUB · 全程本地处理</span></footer>
    </main>
  );
}

export default App;
