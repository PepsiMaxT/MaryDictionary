const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('definitions', {
    getDictionary: () => {return ipcRenderer.invoke('getDictionary');},
    getTags: () => {return ipcRenderer.invoke('getTags');}
});