export const saveToLocalFile = function saveToLocalFile(payload: string, filename: string, mimeType: string): void {
    const contentType = `${mimeType};charset=utf-8;`
    const a = document.createElement('a');
    a.className = 'download-helper'
    a.download = filename;
    a.href = 'data:' + contentType + ',' + encodeURIComponent(payload);
    a.target = '_blank';
    a.click();
}
export const saveCSVToLocalFile = (payload, filename) => saveToLocalFile(payload, filename, 'text/csv')
export const saveObjectToLocalFile = (payload, filename) => saveToLocalFile(JSON.stringify(payload, null, 2), filename, 'application/json')
export default saveToLocalFile