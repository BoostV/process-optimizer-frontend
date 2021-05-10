export default function saveToLocalFile(payload: object, filename: string): void {
    const contentType = 'application/json;charset=utf-8;'
    const a = document.createElement('a');
    a.download = filename;
    a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(payload, null, 2));
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}