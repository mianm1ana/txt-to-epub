// Rebuild volume relationships after edits; reading order remains unchanged.
export function normalizeSections(sections) {
    let volumeTitle = '';
    return sections.map(section => {
        if (section.type === 'volume') volumeTitle = section.title;
        if (section.type === 'intro') volumeTitle = '';
        return { ...section, volumeTitle: section.type === 'chapter' ? volumeTitle : '' };
    });
}

export function editSection(sections, index, { title, type }) {
    if (!sections[index]) throw new Error('请选择要修改的章节');
    if (!title.trim()) throw new Error('标题不能为空');
    if (!['intro', 'volume', 'chapter'].includes(type)) throw new Error('无效的内容类型');
    return normalizeSections(sections.map((section, i) => i === index ? { ...section, title: title.trim(), type } : section));
}

export function mergeWithPrevious(sections, index) {
    if (index < 1 || !sections[index]) throw new Error('第一项不能向前合并');
    const current = sections[index];
    const previous = sections[index - 1];
    return normalizeSections([
        ...sections.slice(0, index - 1),
        { ...previous, paragraphs: [...previous.paragraphs, current.title, ...current.paragraphs] },
        ...sections.slice(index + 1),
    ]);
}
