import { useState } from 'react'

import { createEpub } from "./utils/epub"
import { decodeTxtFile, parseChapters } from "./utils/text";
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
  const [chapters, setChapters] = useState([]); // 解析出来的全部章节
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0); // 当前查看的是第几章
  const [epubBlob, setEpubBlob] = useState(null); // 生成好的 EPUB 文件
  const [status, setStatus] = useState(""); // 底部状态提示文案
  const [converting, setConverting] = useState(false); // 是否正在生成 EPUB（用来禁用按钮、显示“正在转换...”）

  /**
   *  读取并解码用户选择的TXT文件
   *  同时做校验,更新text状态,统计章节数
   */
  async function readSelectedFile(selectedFile,selectedEncoding) {
    if (!selectedFile) {
      return;
    }

    // 只允许.txt
    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      throw new Error("请选择 .txt 文件");
    }

    // 调用工具函数: 按指定/自动编码解码成字符串
    const decodedText = await decodeTxtFile(
      selectedFile,
      selectedEncoding
    );

    // 顺便用同样的规则拆一遍章节,给用户看识别结果
    const parsedChapters = parseChapters(decodedText);

    setChapters(parsedChapters);
    setSelectedChapterIndex(0); // 选中第一章
    setEpubBlob(null); // 重新选文件后,清空之前生成的EPUB Blob
    setStatus(`已读取,识别到 ${parsedChapters.length} 章`);
  }

  /**
   * 文件选择框变化时触发
   * 1. 保存File
   * 2. 如果书名还是空的,用文件名(去掉.txt)当默认书名
   * 3. 立刻读取并解码
   */
  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);

    // 如果书名还是空的,自动用文件名填充
    if (!title) {
      setTitle(selectedFile.name.replace(/\.txt$/i, ""));
    }

    try {
      await readSelectedFile(selectedFile, encoding);
    } catch (error) {
      setStatus(error.message);
    }
  }

  /**
   * 编码下拉框变化时触发
   * 如果已经选过文件,就用新编码重新解码一遍
   */

  async function handleEncodingChange(event) {
    const nextEncoding = event.target.value;
    setEncoding(nextEncoding);

    if (!file) {
      return;// 还没选文件就只改状态,不读盘
    }

    try{
      await readSelectedFile(file, nextEncoding)
    }catch (error) {
      setStatus(error.message);
    }
  }

  /**
   * 点击生成epub或表单提交时触发
   * 真正调用createEpub,然后用浏览器下载
   */
  async function handleGenerate(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    if (!file || chapters.length === 0) {
      setStatus("请先选择TXT文件");
      return;
    }

    setConverting(true);
    setEpubBlob(null);
    setStatus("正在生成EPUB...");

    try {
      // 书名兜底: 没填就用文件名
      const bookTitle =
        title.trim() || file.name.replace(/\.txt$/i, "");
      
      // 核心: 生成EPUB Blob + 章节数
      const { blob, chapterCount } = await createEpub({
        title: bookTitle,
        author: author.trim() || "未知作者",
        chapters,
      });

      setEpubBlob(blob); // 保存生成的EPUB Blob对象,方便预览或下载
      setStatus(`EPUB生成成功,共 ${chapterCount} 章节`);
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

  const selectedChapter = chapters[selectedChapterIndex];

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
          canGenerate={chapters.length > 0}
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
            chapters={chapters}
            selectedIndex={selectedChapterIndex}
            onSelect={setSelectedChapterIndex}
          />
          <ChapterPreview chapter={selectedChapter} />
        </section>
      </div>
    </main>
  );
}

export default App;
