/**
 * epub生成工具,js
 */

import { escapeXml } from "./book-render.js";
import { getPreset, DEFAULT_PRESET_ID } from "../presets/index.js";

import JSZip from "jszip";
import { identifyCover } from "./cover.js";
import { buildHierarchy } from "./hierarchy.js";

/**
 * 生成 EPUB 导航目录。
 * 与网页目录共用层级关系，按部 → 卷 → 章生成嵌套 ol。
 */
function createNavigationItems(sections) {
    const roots = [];
    const nodes = buildHierarchy(sections).map(entry => ({ ...entry, children: [] }));
    nodes.forEach(node => {
        (node.parentIndex === null ? roots : nodes[node.parentIndex].children).push(node);
    });
    function render(node) {
        const children = node.children.length ? `<ol>\n${node.children.map(render).join('\n')}\n</ol>` : '';
        return `<li><a href="section-${node.index + 1}.xhtml">${escapeXml(node.section.title)}</a>${children}</li>`;
    }
    return roots.map(render);
}

/**
 * 核心函数: 根据书名,作者,全文生成标准EPUB文件
 */
export async function createEpub({ title, author, sections, cover = null, presetId = DEFAULT_PRESET_ID }) {
    const preset = getPreset(presetId);
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
        preset.css
    );
    
    // 后面用来拼 content.opf 和目录的数组
    const manifestItems = []; // 清单:所有文件列表
    const spineItems = []; //阅读顺序
    const navigationItems = createNavigationItems(sections); // 目录里的链接

    if (cover) {
        const { mediaType, extension } = identifyCover(cover.data);
        const imagePath = `images/cover.${extension}`;
        zip.file(`OEBPS/${imagePath}`, cover.data);
        zip.file("OEBPS/cover.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN" lang="zh-CN">
<head><meta charset="UTF-8"/><title>${escapeXml(title)} — 封面</title>
<style>body { margin: 0; padding: 0; text-align: center; } img { max-width: 100%; max-height: 100vh; width: auto; height: auto; }</style></head>
<body epub:type="cover"><img src="${imagePath}" alt="${escapeXml(title)} 封面"/></body>
</html>`);
        manifestItems.push(`<item id="cover-image" href="${imagePath}" media-type="${mediaType}" properties="cover-image"/>`);
        manifestItems.push('<item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>');
        spineItems.push('<itemref idref="cover-page"/>');
    }

    // === 4. 为简介、卷和章分别生成 .xhtml 文件 ===
    sections.forEach((section, index) => {
        const number = index + 1;
        const id = `section-${number}`;
        const fileName = `${id}.xhtml`;

        // 写入内容文件
        zip.file(
        `OEBPS/${fileName}`,
        preset.renderSection(section, index)
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
    ${cover ? '<nav epub:type="landmarks" hidden="hidden"><h2>导航</h2><ol><li><a epub:type="cover" href="cover.xhtml">封面</a></li></ol></nav>' : ""}
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
        ${cover ? '<meta name="cover" content="cover-image"/>' : ""}
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
        partCount: sections.filter(section => section.type === "part").length,
        chapterCount: sections.filter(
            (section) => section.type === "chapter"
        ).length,
        volumeCount: sections.filter(
            (section) => section.type === "volume"
        ).length,
    };
}
