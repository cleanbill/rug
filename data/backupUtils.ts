
export const importData = async (storageFn: Function, elementID = 'importData') => {
    const dir = document.getElementById(elementID) as any;
    dir?.click();
    const file = dir.files[0] as File;
    console.log('data is ', file);
    if (!file) {
        return;
    }
    const content = await file.text();
    const json = JSON.parse(content);
    storageFn(json);
    return json;
}


export const exportData = (filenamePrefix: string, data: unknown) => {
    console.log('Exporting ', data);
    const fileName = filenamePrefix + '-' + makeMark(true) + '.json';
    const fileToSave = new Blob([JSON.stringify(data, null, 4)], {
        type: 'application/json'
    });

    const url = window.URL || window.webkitURL;
    const link = url.createObjectURL(fileToSave);
    const a = document.createElement("a");
    a.download = fileName;
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const z = (n: number) => n < 10 ? "0" + n : n + "";
export const makeMark = (includeMinutes = true) => {
    const now = new Date();
    const minutes = includeMinutes ? z(now.getMinutes()) : "00";
    const seconds = "00"; // includeMinutes ? z(now.getSeconds()) : "00";
    const mark = now.getFullYear() + "-" + z(now.getMonth() + 1) + "-" + z(now.getDate()) + ":" + z(now.getHours()) + ':' + minutes + ":" + seconds;
    return mark;
}