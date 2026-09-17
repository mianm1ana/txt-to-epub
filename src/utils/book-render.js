/**
 * 把文本里的特殊字符转成XML/HTML安全写法
 * 防止书名,章节名,正文里的<> & ” ’ 破坏EPUB的XML结构
 */
export function escapeXml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * 根据内容类型生成标题。
 * 章节标题可拆成“章节编号 + 标题”，用于红色编号样式。
 */
function createSectionHeading(section) {
    if (section.type === "volume" || section.type === "part") {
        const prefix = section.type;
        const title = section.title.replace(/^[【[［《]\s*(.*?)\s*[】\]］》]$/, "$1");
        const match = title.match(/^(第[一二三四五六七八九十百千万零〇两0-9]+[卷部])(?:[：:]\s*|\s+)?(.*)$/);
        if (match) {
            const subtitle = match[2].trim();
            return `<h1 class="${prefix}-title"><span class="${prefix}-number">${escapeXml(match[1])}</span>${subtitle ? `<br/><span class="${prefix}-name">${escapeXml(subtitle)}</span>` : ""}</h1>`;
        }
        return `<h1 class="${prefix}-title">${escapeXml(section.title)}</h1>`;
    }

    if (section.type === "chapter") {
        const chapterTitlePattern = /^(第[一二三四五六七八九十百千万零〇两0-9]+[章节回篇]|Chapter\s+\d+)\s*(.*)$/i;
        const specialChapterTitlePattern = /^(序章|楔子|前言|后记|尾声|番外(?:篇[一二三四五六七八九十百千万零〇两0-9]*|[一二三四五六七八九十百千万零〇两0-9]+)?|完本感言)(?:[：:]\s*|\s+)?(.*)$/i;
        const match =
            section.title.match(chapterTitlePattern) ||
            section.title.match(specialChapterTitlePattern);

        if (match) {
            const chapterNumber = escapeXml(match[1]);
            const subtitle = escapeXml(match[2].trim());
            const subtitleHtml = subtitle ? `<br/>${subtitle}` : "";

            return `<h2 class="head"><span>${chapterNumber}</span>${subtitleHtml}</h2>`;
        }

        return `<h2 class="head">${escapeXml(section.title)}</h2>`;
    }

    return `<h2 class="intro-title"><span>${escapeXml(section.title)}</span></h2>`;
}

/**
 * 把简介、卷或章转成 EPUB 需要的 XHTML 文件内容。
 * 卷使用 h1，简介和章使用 h2。
 * @param {{type: string, title: string, paragraphs: string[]}} section
 * @param {number} index - 内容序号（从 0 开始）
 */
export function createSectionXhtml(section, index) {
    const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
        .join("\n");

    const heading = createSectionHeading(section);

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
    <section id="section-${index + 1}"${['intro', 'part', 'volume'].includes(section.type) ? ` class="opening opening--${section.type}"` : ""}>
      ${heading}
      ${paragraphs}
    </section>
  </body>
</html>`;
}
