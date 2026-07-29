/**
 * 把书名转成安全的文件名
 * Windows / macOS 不允许文件名出现 \ / : * ? " < > | 这些字符
 * 出现就替换成下划线，避免下载失败
 */
export function safeFilename(value) {
    return value
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim() || "book";
}

export function downloadBlob(blob, filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(downloadurl);
    }, 1000);
}


