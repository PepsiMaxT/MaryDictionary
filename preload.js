const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('definitions', {
    dictionary: () => ipcRenderer.Invoke('getDictionary'),
    getTags: () => ipcRenderer.Invoke('getTags')
});