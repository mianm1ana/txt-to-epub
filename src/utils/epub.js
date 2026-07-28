/**
 * epub生成工具,js
 */

import JSZip from "jszip";

/**
 * 把文本里的特殊字符转成XML/HTML安全写法
 * 防止书名,章节名,正文里的<> & ” ’ 破坏EPUB的XML结构
 */
function escapeXml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * 读取用户选择的TXT文件,并尽量自动识别编码
 * @param {File} file - 用户上传的 .txt 文件
 * @param {string} encoding - "auto" | "utf-8" | "gb18030" 等
 * @returns {Promise<string>} 解码后的纯文本
 */
export async function decodeTxtFile(file, encoding = "auto") {
    //先把文件读成二进制ArrayBuffer
    const buffer = await file.arrayBuffer();

    //如果用户手动指定了编码,就直接用指定编码
    if (encoding !== "auto") {
        return new TextDecoder(encoding).decode(buffer);
    }

    //自动模式: 优先尝试UTF-8(fatal: true 表示遇到非法字节就报错)
    try {
        return new TextDecoder("utf-8", {
            fatal: true,
        }).decode(buffer);
    } catch {
        // UTF-8 失败,就按中文最常见的GB18030(兼容GBK) 解码
        return new TextDecoder("gb18030").decode(buffer);
    }
}

/**
 * 把整本TXT文本按章节拆分
 * 规则: 识别“第X章 / 第X回 / Chapter 1 / 序章 / 楔子 / 前言 / 后记 / 尾声”等标题
 * @param {string} text - 整本书的纯文本
 * @returns {Array<{title: string, paragraphs: string[]}>}
 */
export function parseChapters(text) {
    // 统一换行符为 \n,再按行切开
    const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

    // 章节中的标题
    const chapterPattern = /^(第[一二三四五六七八九十百千万零〇两0-9]+[章节回卷].*|Chapter\s+\d+.*|序章.*|楔子.*|前言.*|后记.*|尾声.*)$/i;

    const chapters = [];
    let currentChapter = null; //当前正在收集的章节
    
    for (const originalLine of lines) {
        const line = originalLine.trim(); // 去掉首尾空白

        // 如果这一行是章节标题
        if (chapterPattern.test(line)) {
            // 开启新章节
            currentChapter = {
                title: line,
                paragraphs: [],
            };
            chapters.push(currentChapter);
            continue;
        }

        // 如果还没有任何章节,就先建一个默认的「正文」章节
        if (!currentChapter) {
            currentChapter = {
                title: "正文",
                paragraphs: [],
            };
            chapters.push(currentChapter);
        } 

        // 非空行就当作段落加进去
        if (line) {
            currentChapter.paragraphs.push(line);
        }
    }

    // 过滤掉安全空的章节
    return chapters.filter(
        (chapter) => chapter.title || chapter.paragraphs.length > 0
    );
}

/**
 * 把单个章节转成EPUB需要的XHTML文件内容
 * @param {{title: string, paragraphs: string[]}} chapter
 * @param {number} index - 章节序号（从 0 开始）
 */
function createChapterXhtml(chapter, index) {
    //把每个段落包成<p>,并做好XML转义
    const paragraphs = chapter.paragraphs
        .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
        .join("\n");
    
    // 返回完整的 XHTML 文档字符串
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xml:lang="zh-CN"
  lang="zh-CN"
>
  <head>
    <meta charset="UTF-8"/>
    <title>${escapeXml(chapter.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <section id="chapter-${index + 1}">
      <h1>${escapeXml(chapter.title)}</h1>
      ${paragraphs}
    </section>
  </body>
</html>`;
}

/**
 * 核心函数: 根据书名,作者,全文生成标准EPUB文件
 */
export async function createEpub({ title, author, text}) {
    const zip = new JSZip(); // EPUB 本质就是一个特殊结构的ZIP
    const chapters = parseChapters(text); // 先拆章节

    if (chapters.length === 0) {
        throw new Error("TXT 文件没有可转换的内容");
    }

    // 生成唯一标识符 (EPUB 规范要求)
    const identifier = 
    typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `book-${Date.now()}`;

    // 修改时间 (ISO 格式,去掉毫秒)
    const modified = new Date()
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
    
    // === 1. mimetype (必须是第一个文件,且不能压缩) ===
    // EPUB 规范强制要求
    zip.file("mimetype", "application/epub+zip", {
        compression: "STORE", // 不压缩
    });

    // === 2. META-INF/container.xml ===
    // 告诉阅读器「真正的内容入口在 OEBPS/content.opf」
    zip.file(
        "META-INF/container.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
    <container
    version="1.0"
    xmlns="urn:oasis:names:tc:opendocument:xmlns:container"
    >
    <rootfiles>
        <rootfile
        full-path="OEBPS/content.opf"
        media-type="application/oebps-package+xml"
        />
    </rootfiles>
    </container>`
    );

    // === 3. 样式表 ===
    zip.file(
        "OEBPS/style.css",
        `body {
    font-family: serif;
    line-height: 1.8;
    margin: 5%;
    }

    h1 {
    font-size: 1.5em;
    text-align: center;
    margin-bottom: 2em;
    }

    p {
    margin: 0.5em 0;
    text-indent: 2em;
    }`
    );
    
    // 后面用来拼 content.opf 和目录的数组
    const manifestItems = []; // 清单:所有文件列表
    const spineItems = []; //阅读顺序
    const navigationItems = []; // 目录里的链接

    // === 4. 为每一章生成一个 .xhtml 文件 ===
    chapters.forEach((chapter, index) => {
        const number = index + 1;
        const id = `chapter-${number}`;
        const fileName = `${id}.xhtml`;

        // 写入章节文件
        zip.file(
        `OEBPS/${fileName}`,
        createChapterXhtml(chapter, index)
        );

        // 加入清单
        manifestItems.push(
        `<item id="${id}" href="${fileName}" media-type="application/xhtml+xml"/>`
        );

        // 加入阅读顺序
        spineItems.push(`<itemref idref="${id}"/>`);

        // 加入目录
        navigationItems.push(
        `<li><a href="${fileName}">${escapeXml(chapter.title)}</a></li>`
        );
    });

    // === 5. 目录文件 nav.xhtml (EPUB3 标准目录) ===
    zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:epub="http://www.idpf.org/2007/ops"
  xml:lang="zh-CN"
  lang="zh-CN"
>
  <head>
    <meta charset="UTF-8"/>
    <title>目录</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>目录</h1>
      <ol>
        ${navigationItems.join("\n")}
      </ol>
    </nav>
  </body>
</html>`
    );

    // === 6. 核心元数据文件 content.opf ===
    // 包含: 书名,作者,语言,文件清单,阅读顺序
    zip.file(
        "OEBPS/content.opf",
        `<?xml version="1.0" encoding="UTF-8"?>
    <package
    xmlns="http://www.idpf.org/2007/opf"
    version="3.0"
    unique-identifier="book-id"
    xml:lang="zh-CN"
    >
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="book-id">${escapeXml(identifier)}</dc:identifier>
        <dc:title>${escapeXml(title)}</dc:title>
        <dc:creator>${escapeXml(author || "未知作者")}</dc:creator>
        <dc:language>zh-CN</dc:language>
        <meta property="dcterms:modified">${modified}</meta>
    </metadata>

    <manifest>
        <item
        id="nav"
        href="nav.xhtml"
        media-type="application/xhtml+xml"
        properties="nav"
        />
        <item
        id="style"
        href="style.css"
        media-type="text/css"
        />
        ${manifestItems.join("\n")}
    </manifest>

    <spine>
        ${spineItems.join("\n")}
    </spine>
    </package>`
    );
    
    // === 7. 打包成 EPUB ===
    const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/epub+zip",
        compression: "DEFLATE", //正文可以压缩
        compressionOptions: {
            level: 6, //压缩级别 1~9,6 比较均衡
        },
    });

    //返回生成的文件和章节数量,方便UI展示
    return {
        blob,
        chapterCount: chapters.length,
    };
}
