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
    const volumePattern = new RegExp(`^第[${chineseNumber}]+卷.*$`);
    const chapterPattern = new RegExp(
        `^(第[${chineseNumber}]+[章节回篇].*|Chapter\\s+\\d+.*|序章.*|楔子.*|前言.*|后记.*|尾声.*)$`,
        "i",
    );

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

    for (const originalLine of lines) {
        const line = originalLine.trim();

        if (!line) {
            continue;
        }

        if (volumePattern.test(line)) {
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

        if (chapterPattern.test(line)) {
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
