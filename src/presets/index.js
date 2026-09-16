import { classicPreset } from "./classic.js";

export const PRESETS = [classicPreset];
export const DEFAULT_PRESET_ID = classicPreset.id;

export function getPreset(id = DEFAULT_PRESET_ID) {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) throw new Error(`找不到生成预设：${id}`);
    return preset;
}

// 与导出使用同一 XHTML 和样式，仅将外部样式表内联用于独立预览。
export function createPreviewDocument(section, presetId = DEFAULT_PRESET_ID) {
    const preset = getPreset(presetId);
    return preset.renderSection(section, 0).replace(
        '<link rel="stylesheet" type="text/css" href="style.css"/>',
        () => `<style>${preset.css}</style>`,
    );
}
