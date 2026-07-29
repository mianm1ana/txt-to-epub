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