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
 * 把简介、卷或章转成 EPUB 需要的 XHTML 文件内容。
 * 卷使用 h1，简介和章使用 h2。
 * @param {{type: string, title: string, paragraphs: string[]}} section
 * @param {number} index - 内容序号（从 0 开始）
 */
function createSectionXhtml(section, index) {
    const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
        .join("\n");

    const headingTag = section.type === "volume" ? "h1" : "h2";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xml:lang="zh-CN"
  lang="zh-CN"
>
  <head>
    <meta charset="UTF-8"/>
    <title>${escapeXml(section.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <section id="section-${index + 1}">
      <${headingTag}>${escapeXml(section.title)}</${headingTag}>
      ${paragraphs}
    </section>
  </body>
</html>`;
}

/**
 * 生成 EPUB 导航目录。
 * 简介和无卷章节在顶层；卷在顶层，其章节放在内部 ol 中。
 */
function createNavigationItems(sections) {
    const groups = [];
    let currentVolumeGroup = null;

    sections.forEach((section, index) => {
        const entry = {
            section,
            fileName: `section-${index + 1}.xhtml`,
        };

        if (section.type === "volume") {
            currentVolumeGroup = {
                volume: entry,
                chapters: [],
            };
            groups.push(currentVolumeGroup);
            return;
        }

        const belongsToCurrentVolume =
            section.type === "chapter" &&
            section.volumeTitle &&
            currentVolumeGroup?.volume.section.title === section.volumeTitle;

        if (belongsToCurrentVolume) {
            currentVolumeGroup.chapters.push(entry);
            return;
        }

        groups.push({ standalone: entry });
    });

    return groups.map((group) => {
        if (group.standalone) {
            const { section, fileName } = group.standalone;
            return `<li><a href="${fileName}">${escapeXml(section.title)}</a></li>`;
        }

        const { section, fileName } = group.volume;
        const nestedChapters = group.chapters
            .map((chapter) => (
                `<li><a href="${chapter.fileName}">${escapeXml(chapter.section.title)}</a></li>`
            ))
            .join("\n");
        const nestedList = nestedChapters
            ? `<ol>\n${nestedChapters}\n</ol>`
            : "";

        return `<li><a href="${fileName}">${escapeXml(section.title)}</a>${nestedList}</li>`;
    });
}

/**
 * 核心函数: 根据书名,作者,全文生成标准EPUB文件
 */
export async function createEpub({ title, author, sections }) {
    const zip = new JSZip(); // EPUB 本质就是一个特殊结构的ZIP

    if (sections.length === 0) {
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
    font-size: 2em;
    text-align: center;
    margin: 25% 0 0;
    }

    h2 {
    font-size: 1.5em;
    text-align: center;
    margin: 0 0 2em;
    }

    p {
    margin: 0.5em 0;
    text-indent: 2em;
    }`
    );
    
    // 后面用来拼 content.opf 和目录的数组
    const manifestItems = []; // 清单:所有文件列表
    const spineItems = []; //阅读顺序
    const navigationItems = createNavigationItems(sections); // 目录里的链接

    // === 4. 为简介、卷和章分别生成 .xhtml 文件 ===
    sections.forEach((section, index) => {
        const number = index + 1;
        const id = `section-${number}`;
        const fileName = `${id}.xhtml`;

        // 写入内容文件
        zip.file(
        `OEBPS/${fileName}`,
        createSectionXhtml(section, index)
        );

        // 加入清单
        manifestItems.push(
        `<item id="${id}" href="${fileName}" media-type="application/xhtml+xml"/>`
        );

        // 加入阅读顺序
        spineItems.push(`<itemref idref="${id}"/>`);

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
        chapterCount: sections.filter(
            (section) => section.type === "chapter"
        ).length,
        volumeCount: sections.filter(
            (section) => section.type === "volume"
        ).length,
    };
}
