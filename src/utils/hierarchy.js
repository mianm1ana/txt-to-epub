// Parents are resolved by position, never by title: repeated volume names are valid.
export function buildHierarchy(sections) {
    let part = null;
    let volume = null;
    return sections.map((section, index) => {
        if (section.type === 'intro' || section.type === 'part') {
            part = null;
            volume = null;
        } else if (section.type === 'volume') {
            volume = null;
        }
        const parent = section.type === 'chapter' ? volume || part
            : section.type === 'volume' ? part : null;
        const entry = {
            index,
            parentIndex: parent?.index ?? null,
            depth: parent ? parent.depth + 1 : 0,
            section: {
                ...section,
                partTitle: part?.section.title || '',
                volumeTitle: section.type === 'chapter' ? volume?.section.title || '' : '',
            },
        };
        if (section.type === 'part') part = entry;
        if (section.type === 'volume') volume = entry;
        return entry;
    });
}

export function normalizeSections(sections) {
    return buildHierarchy(sections).map(entry => entry.section);
}
