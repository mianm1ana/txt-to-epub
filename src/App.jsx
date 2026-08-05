import { useState } from 'react'

import { createEpub } from "./utils/epub"
import { decodeTxtFile, parseBookSections } from "./utils/text";
import { downloadBlob, safeFilename } from "./utils/download"

import ChapterList from "./components/ChapterList"
import ChapterPreview from './components/ChapterPreview';
import BookForm from './components/BookForm';

import './App.css';



function App() {
  // --- 页面状态 ---
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [encoding, setEncoding] = useState("auto"); // 文本编码：auto / utf-8 / gb18030
  const [sections, setSections] = useState([]); // 解析出来的简介、卷和章节
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0); // 当前查看的是哪一项
  const [epubBlob, setEpubBlob] = useState(null); // 生成好的 EPUB 文件
  const [status, setStatus] = useState(""); // 底部状态提示文案
  const [converting, setConverting] = useState(false); // 是否正在生成 EPUB（用来禁用按钮、显示“正在转换...”）

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

    if (!file) {
      setStatus("请先选择TXT文件");
      return;
    }

    setConverting(true);
    setEpubBlob(null);
    setStatus("正在解析 TXT 并生成 EPUB...");

    try {
      const decodedText = await decodeTxtFile(file, encoding);
      const parsedSections = parseBookSections(decodedText);

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
      });

      setEpubBlob(blob); // 保存生成的EPUB Blob对象,方便预览或下载
      setStatus(`EPUB 生成成功，共 ${volumeCount} 卷、${chapterCount} 章`);
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
      <header className="header">
        <h1>TXT to EPUB</h1>
        <p>所有文件都在当前浏览器中处理,保护隐私</p>
      </header>

      <div className="workspace">
        {/* 左侧：表单操作区 */}
        <BookForm
          title={title}
          author={author}
          encoding={encoding}
          converting={converting}
          canGenerate={Boolean(file)}
          canDownload={Boolean(epubBlob)}
          status={status}
          onFileChange={handleFileChange}
          onEncodingChange={handleEncodingChange}
          onTitleChange={setTitle}
          onAuthorChange={setAuthor}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
        />
        
        <section className="chapter-workspace">
          <ChapterList
            sections={sections}
            selectedIndex={selectedSectionIndex}
            onSelect={setSelectedSectionIndex}
          />
          <ChapterPreview section={selectedSection} />
        </section>
      </div>
    </main>
  );
}

export default App;
