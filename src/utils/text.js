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
 * @typedef {Object} BookSection
 * @property {"intro" | "volume" | "chapter"} type
 * @property {string} title
 * @property {string} volumeTitle
 * @property {string[]} paragraphs
 */

/**
 * 把整本 TXT 拆成“简介 / 卷 / 章”。
 *
 * 规则：
 * 1. 第一个卷或章标题之前的内容是简介。
 * 2. “第X卷”是卷。
 * 3. “第X章/节/回/篇”、Chapter N、序章等是章节。
 * 4. 没有任何结构标题时，整本书作为一个“正文”章节。
 *
 * @param {string} text - 整本书的纯文本
 * @returns {BookSection[]}
 */
export function parseBookSections(text) {
    const lines = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n");

    const chineseNumber = "一二三四五六七八九十百千万零〇两0-9";
    const volumeCore = `第[${chineseNumber}]+[卷部]`;
    const extraChapterCore = `(?:番外(?:篇[${chineseNumber}]*|[${chineseNumber}]+)?|完本感言)`;
    const chapterCore = `(?:第[${chineseNumber}]+[章节回篇]|Chapter\\s+\\d+|序章|楔子|前言|后记|尾声|${extraChapterCore})`;
    const maximumHeadingLength = 80;

    // 带括号的标题格式很明确，不要求前后必须有空行。
    const decoratedVolumePattern = new RegExp(
        `^[【\\[［《]\\s*${volumeCore}[^】\\]］》]*[】\\]］》]$`,
        "i",
    );
    const decoratedChapterPattern = new RegExp(
        `^[【\\[［《]\\s*${chapterCore}[^】\\]］》]*[】\\]］》]$`,
        "i",
    );

    const exactVolumePattern = new RegExp(`^${volumeCore}$`, "i");
    const colonVolumePattern = new RegExp(`^${volumeCore}[：:]\\s*\\S.*$`, "i");
    const spacedVolumePattern = new RegExp(`^${volumeCore}\\s+\\S.*$`, "i");
    const exactChapterPattern = new RegExp(`^${chapterCore}$`, "i");
    const colonChapterPattern = new RegExp(`^${chapterCore}[：:]\\s*\\S.*$`, "i");
    const spacedChapterPattern = new RegExp(`^${chapterCore}\\s+\\S.*$`, "i");

    function isLikelyHeading(line, type) {
        if (line.length > maximumHeadingLength) {
            return false;
        }

        const patterns = type === "volume"
            ? {
                decorated: decoratedVolumePattern,
                exact: exactVolumePattern,
                colon: colonVolumePattern,
                spaced: spacedVolumePattern,
            }
            : {
                decorated: decoratedChapterPattern,
                exact: exactChapterPattern,
                colon: colonChapterPattern,
                spaced: spacedChapterPattern,
            };

        if (patterns.decorated.test(line)) {
            return true;
        }

        // 普通正文句子常带句号或分号，不应被当作标题。
        if (/[。；;]/.test(line)) {
            return false;
        }

        if (patterns.exact.test(line) || patterns.colon.test(line)) {
            return true;
        }

        // 空格本身也是标题编号和标题正文之间的明确分隔符。
        return patterns.spaced.test(line);
    }

    /** @type {BookSection[]} */
    const sections = [];
    const beforeFirstHeading = [];

    let currentSection = null;
    let currentVolumeTitle = "";
    let foundHeading = false;

    function addIntroIfNeeded() {
        if (beforeFirstHeading.length === 0) {
            return;
        }

        sections.push({
            type: "intro",
            title: "简介",
            volumeTitle: "",
            paragraphs: [...beforeFirstHeading],
        });
        beforeFirstHeading.length = 0;
    }

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index].trim();

        if (!line) {
            continue;
        }

        if (isLikelyHeading(line, "volume")) {
            if (!foundHeading) {
                addIntroIfNeeded();
            }

            foundHeading = true;
            currentVolumeTitle = line;
            currentSection = {
                type: "volume",
                title: line,
                volumeTitle: "",
                paragraphs: [],
            };
            sections.push(currentSection);
            continue;
        }

        if (isLikelyHeading(line, "chapter")) {
            if (!foundHeading) {
                addIntroIfNeeded();
            }

            foundHeading = true;
            currentSection = {
                type: "chapter",
                title: line,
                volumeTitle: currentVolumeTitle,
                paragraphs: [],
            };
            sections.push(currentSection);
            continue;
        }

        if (!foundHeading) {
            beforeFirstHeading.push(line);
            continue;
        }

        if (currentSection) {
            currentSection.paragraphs.push(line);
        }
    }

    if (!foundHeading && beforeFirstHeading.length > 0) {
        return [{
            type: "chapter",
            title: "正文",
            volumeTitle: "",
            paragraphs: beforeFirstHeading,
        }];
    }

    return sections;
}
