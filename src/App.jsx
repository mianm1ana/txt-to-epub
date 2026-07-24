import { useState } from 'react'
// 从工具文件引入: 生成EPUB 解码TXT文件 拆分章节
import {
  createEpub,
  decodeTxtFile,
  parseChapters,
} from "./utils/epub";
import './App.css';

/**
 * 把书名转成安全的文件名
 * Windows / macOS 不允许文件名出现 \ / : * ? " < > | 这些字符
 * 出现就替换成下划线，避免下载失败
 */
function safeFilename(value) {
  return value
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim() || "book";
}

function App() {
  // --- 页面状态 ---
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [encoding, setEncoding] = useState("auto"); // 文本编码：auto / utf-8 / gb18030
  const [text, setText] = useState(""); // 解码后的整本书纯文本
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

    // 存进state,后面预览和生成epub都会用到
    setText(decodedText);

    // 顺便用同样的规则拆一遍章节,给用户看识别结果
    const chapters = parseChapters(decodedText);
    setStatus(`已读取,识别到 ${chapters.length} 章`);
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
    setEncoding(newEncoding);

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
  async function handleConvert(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    if (!file || !text) {
      setStatus("请先选择TXT文件");
      return;
    }

    setConvverting(true);
    setStatus("正在生成EPUB...");

    try {
      // 书名兜底: 没填就用文件名
      const bookTitle =
        title.trim() || file.name.reaplace(/\.txt$/i, "");
      
      // 核心: 生成EPUB Blob + 章节数
      const { blob, chapterCount } = await createEpub({
        title: bookTitle,
        author: author.trim() || "未知作者",
        text,
      });
      
      // --- 触发浏览器下载 ---
      const downloadUrl = Url.createObjectURL(blob); // 内存里的临时地址
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `${safeFilename(bookTitle)}.epub`;// 下载文件名称

      document.body.appendChild(link);
      link.click(); // 模拟点击下载
      link.remove();

      //下载触发后,释放内存里的Object URL,避免泄露
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setStatus(`转换完成,共 ${chapterCount} 章节`);
    }catch (error) {
      console.error(error);
      setStatus(`转换失败: ${error.message}`);
    }finally {
      // 无论成功失败,都结束“转换中”状态
      setConverting(false);
    }
  }

  // --- 界面 ---
  return (
    <main className="page">
      <header className="header">
        <h1>TXT to EPUB</h1>
        <p>所有文件都在当前浏览器中处理,保护隐私</p>
      </header>

      <div className="workspace">
        {/* 左侧：表单操作区 */}
        <form className="form" onSubmit={handleConvert}>
          {/* 选文件 */}
          <label className="field">
            <span>TXT 文件</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
            />
          </label>

          {/* 编码选择: 乱码时手动切 */}
          <label className="field">
            <span>文本编码</span>
            <select
              value={encoding}
              onChange={handleEncodingChange}
            >
              <option value="auto">自动检测</option>
              <option value="utf-8">UTF-8</option>
              <option value="gb18030">GBK / GB18030</option>
            </select>
          </label>

          {/* 书名（会写进 EPUB 元数据 + 下载文件名） */}
          <label className="field">
            <span>书名</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="请输入书名"
            />
          </label>

           {/* 作者（会写进 EPUB 元数据） */}
           <label className="field">
            <span>作者</span>
            <Input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="请输入作者名"
            />
          </label>

          {/* 提交按钮 */}
          <button
            className="convert-button"
            type="submit"
            disabled={converting || !file}
          >
            {converting ? "正在转换..." : "生成 EPUB"}
          </button>

          {/* 状态提示（aria-live 方便读屏软件） */}
          <div className="status" aria-live="polite">
            {status || "请选择一个TXT文件"}
          </div>
        </form>

        {/* 右侧：文本预览（只显示前 10000 字，避免超大 TXT 卡死页面） */}
        <section className="preview">
          <div className="preview-header">
            <h2>内容预览</h2>
            <span>
              {text ? `${text.length.toLocaleString}字符` : "暂无内容"}
            </span>
          </div>

          <pre>
            {text
              ? text.slice(0, 10000)
              : "选择文件后在这里预览文本"}
          </pre>

          {text.length > 10000 && (
            <p className="preview-note">
              为保证页面流畅,仅显示前10000个字符
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;