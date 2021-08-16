export const saveToLocalFile = function saveToLocalFile(payload: object, filename: string, mimeType: string): void {
    const contentType = `${mimeType};charset=utf-8;`
    const a = document.createElement('a');
    a.className = 'download-helper'
    a.download = filename;
    a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.target = '_blank';
    a.click();
}
export default saveToLocalFile